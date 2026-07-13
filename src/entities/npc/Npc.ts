import * as THREE from 'three';
import {
  COO_MAX_INTERVAL,
  COO_MIN_INTERVAL,
  COO_REF_DISTANCE,
  COO_VOLUME,
  GROUND_RADIUS,
  NPC_CHASE_RANGE,
  NPC_FIGHT_RANGE,
  NPC_GATHER_RANGE,
  NPC_PERSON_GATHER_RADIUS,
  PIGEON_COLLISION_RADIUS,
  PLAYER_APPROACH_CHANCE,
  PLAYER_CHARM_RANGE,
  PLAYER_COO_RANGE,
  PLAYER_FIGHT_FLEE_TIME,
  PLAYER_FIGHT_RANGE,
  PLAYER_GATHER_RADIUS,
  RICE_EAT_DISTANCE,
} from '../../config';
import { rand, ringPoint, randomPointOnDisc, shortestAngle, type Point2 } from '../../utils/math';
import { type CollisionAgent, type CollisionWorld } from '../../world/collision';
import type { FoodSource } from '../../world/rice';
import type { PigeonModel } from '../pigeonModel';
import { applyPigeonTint } from '../pigeon/plumage';

/**
 * Behavioural states. `walk`/`idle` are the ambient loop (wander + peck);
 * `chase`, `flee` and `fight` are transient social interactions between birds.
 */
type NpcMode = 'walk' | 'idle' | 'chase' | 'flee' | 'fight';

/** A ground point pigeons can be told to gather around (e.g. the person). */
export type GatherAnchor = () => THREE.Vector3 | null;

type WanderTarget = Point2;

/** Shared audio resources needed for an NPC to coo in 3D space. */
export interface NpcAudio {
  listener: THREE.AudioListener;
  cooBuffer: AudioBuffer;
}

/** A random spot on the ground, kept a little inside the roam radius. */
function randomWanderTarget(): WanderTarget {
  return randomPointOnDisc(2, GROUND_RADIUS - 2);
}

/**
 * A wandering NPC pigeon: walks to random spots with a head-bob, then pauses
 * to peck at the ground and glance around, just like a real park pigeon.
 */
export class Npc {
  private readonly group: THREE.Group;
  private readonly inner: THREE.Object3D;

  private targetHeading: number;
  private state: NpcMode = 'idle';
  private timer = rand(0.5, 3);
  private lookTimer = rand(0.6, 2);
  private readonly speed = rand(1.1, 2.0);
  private bobPhase = rand(0, Math.PI * 2);
  private peckPhase = rand(0, Math.PI * 2);
  private target: WanderTarget = randomWanderTarget();

  private readonly coo: THREE.PositionalAudio | null = null;
  private cooTimer = rand(COO_MIN_INTERVAL, COO_MAX_INTERVAL);

  private readonly food: FoodSource | null;
  private eatTimer = 0;

  private readonly agent: CollisionAgent;

  // Social behaviour: the shared flock, the person to congregate around, and
  // the transient partners for chasing/fleeing/fighting interactions.
  private flock: Npc[] = [];
  private readonly personAnchor: GatherAnchor | null;
  private readonly playerAnchor: GatherAnchor | null;
  private socialTimer = rand(1.5, 4);
  private chaseTarget: Npc | null = null;
  private fleeOrigin: { x: number; z: number } | null = null;
  private fightPartner: Npc | null = null;
  private fightPhase = 0;

  constructor(
    scene: THREE.Scene,
    model: PigeonModel,
    private readonly world: CollisionWorld,
    audio?: NpcAudio,
    food?: FoodSource,
    personAnchor?: GatherAnchor,
    playerAnchor?: GatherAnchor,
  ) {
    this.inner = model.proto.clone(true);
    this.inner.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    applyPigeonTint(this.inner);

    this.group = new THREE.Group();
    this.group.add(this.inner);
    this.group.scale.setScalar(model.scale);

    const spot = randomWanderTarget();
    this.group.position.set(spot.x, 0, spot.z);

    const heading = rand(0, Math.PI * 2);
    this.group.rotation.y = heading;
    this.targetHeading = heading;

    if (audio) {
      const coo = new THREE.PositionalAudio(audio.listener);
      coo.setBuffer(audio.cooBuffer);
      coo.setRefDistance(COO_REF_DISTANCE);
      coo.setRolloffFactor(1.4);
      coo.setVolume(COO_VOLUME);
      this.group.add(coo);
      this.coo = coo;
    }

    scene.add(this.group);
    this.food = food ?? null;
    this.personAnchor = personAnchor ?? null;
    this.playerAnchor = playerAnchor ?? null;

    // Take part in collision so pigeons don't overlap each other or objects.
    this.agent = { position: this.group.position, radius: PIGEON_COLLISION_RADIUS };
    this.world.addAgent(this.agent);
  }

  /** Give this pigeon awareness of the whole flock for social behaviour. */
  setFlock(flock: Npc[]): void {
    this.flock = flock;
  }

  /**
   * React to the player's friendly coo: if in earshot, turn toward the player,
   * amble over to gather round it, and coo back in acknowledgement. A spooked
   * or squabbling bird is too busy to respond.
   */
  reactToPlayerCoo(player: THREE.Vector3): void {
    if (this.state === 'flee' || this.state === 'fight') return;
    const dx = player.x - this.group.position.x;
    const dz = player.z - this.group.position.z;
    if (Math.hypot(dx, dz) > PLAYER_COO_RANGE) return;

    this.targetHeading = Math.atan2(dx, dz); // look toward the friendly caller
    this.target = this.ringTarget(player.x, player.z, 1.0, PLAYER_GATHER_RADIUS);
    this.state = 'walk';
    this.socialTimer = rand(4, 7); // linger nearby rather than wandering off
    if (this.coo) this.cooTimer = rand(0.2, 0.8); // coo back shortly
  }

  /**
   * React to the player's aggressive display: if within the threat range, drop
   * whatever it's doing and scurry defensively away from the player.
   */
  reactToPlayerFight(player: THREE.Vector3): void {
    const dx = this.group.position.x - player.x;
    const dz = this.group.position.z - player.z;
    if (Math.hypot(dx, dz) > PLAYER_FIGHT_RANGE) return;

    this.chaseTarget = null;
    this.fightPartner = null;
    this.inner.rotation.z = 0;
    this.fleeOrigin = player; // flee from the player's live position
    this.state = 'flee';
    this.timer = PLAYER_FIGHT_FLEE_TIME;
  }

  update(delta: number): void {
    switch (this.state) {
      case 'chase':
        this.updateChase(delta);
        break;
      case 'flee':
        this.updateFlee(delta);
        break;
      case 'fight':
        this.updateFight(delta);
        break;
      default:
        this.updateAmbient(delta);
        break;
    }

    // Smoothly rotate toward the desired heading (shortest path).
    this.group.rotation.y +=
      shortestAngle(this.targetHeading, this.group.rotation.y) * Math.min(1, 6 * delta);

    // Keep clear of benches, trees, the person and the other pigeons.
    this.world.resolveStatic(this.group.position, PIGEON_COLLISION_RADIUS);
    this.world.resolveAgents(this.agent);

    this.updateCoo(delta);
  }

  /** Ambient loop: seek food if any, otherwise wander/gather and peck. */
  private updateAmbient(delta: number): void {
    const { group, inner } = this;

    const grain = this.food ? this.food.nearest(group.position.x, group.position.z) : null;
    if (grain) {
      this.seekFood(grain, delta);
      return;
    }

    if (this.state === 'walk') {
      const dx = this.target.x - group.position.x;
      const dz = this.target.z - group.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 0.4) {
        // Arrived: pause to peck and look around.
        this.state = 'idle';
        this.timer = rand(1.5, 4.5);
        this.peckPhase = 0;
      } else {
        this.strut(dx, dz, dist, this.speed, delta);
      }
      return;
    }

    // Idle: peck at the ground and occasionally glance around.
    this.timer -= delta;
    group.position.y = 0;

    this.peckPhase += delta * 5;
    // max(0, sin) gives repeated downward pecks with pauses between.
    inner.rotation.x = Math.max(0, Math.sin(this.peckPhase)) * 0.5;

    this.lookTimer -= delta;
    if (this.lookTimer <= 0) {
      this.targetHeading += rand(-1.2, 1.2);
      this.lookTimer = rand(0.8, 2.2);
    }

    // Mostly potter about and peck alone; only occasionally break out into a
    // social interaction. The player pigeon is charming, though: when it's
    // nearby, birds notice sooner and are far more eager to go interact.
    this.socialTimer -= delta;
    if (this.socialTimer <= 0) {
      const playerNear = this.playerDistance() <= PLAYER_CHARM_RANGE;
      this.socialTimer = playerNear ? rand(1.5, 4) : rand(4, 9);
      const chance = playerNear ? PLAYER_APPROACH_CHANCE : 0.2;
      if (Math.random() < chance && this.tryStartInteraction()) return;
    }

    if (this.timer <= 0) {
      this.target = randomWanderTarget();
      this.state = 'walk';
    }
  }

  /** Take one strut step toward (dx, dz), with the characteristic head-bob. */
  private strut(dx: number, dz: number, dist: number, speed: number, delta: number): void {
    const { group, inner } = this;
    this.targetHeading = Math.atan2(dx, dz);
    const step = Math.min(speed * delta, dist);
    group.position.x += (dx / dist) * step;
    group.position.z += (dz / dist) * step;
    this.bobPhase += delta * speed * 9;
    inner.rotation.x = Math.sin(this.bobPhase) * 0.12;
    group.position.y = Math.abs(Math.sin(this.bobPhase)) * 0.04;
  }

  /** A random spot in a ring around a point (used to gather near a target). */
  private ringTarget(cx: number, cz: number, min: number, max: number): WanderTarget {
    return ringPoint(cx, cz, min, max);
  }

  /** Distance to the player pigeon on the ground, or Infinity if unknown. */
  private playerDistance(): number {
    const p = this.playerAnchor?.() ?? null;
    if (!p) return Infinity;
    return Math.hypot(p.x - this.group.position.x, p.z - this.group.position.z);
  }

  /** Average position of flock-mates within gathering range, if any. */
  private flockCentre(): { x: number; z: number } | null {
    let sx = 0;
    let sz = 0;
    let n = 0;
    const range = NPC_GATHER_RANGE * NPC_GATHER_RANGE;
    for (const other of this.flock) {
      if (other === this) continue;
      const dx = other.group.position.x - this.group.position.x;
      const dz = other.group.position.z - this.group.position.z;
      if (dx * dx + dz * dz <= range) {
        sx += other.group.position.x;
        sz += other.group.position.z;
        n++;
      }
    }
    return n === 0 ? null : { x: sx / n, z: sz / n };
  }

  /** True while locked in a transient social interaction (don't re-target). */
  private isBusy(): boolean {
    return this.state === 'chase' || this.state === 'flee' || this.state === 'fight';
  }

  /**
   * Maybe pick a fight with, or give chase to, the nearest available bird.
   * Returns true if an interaction was started.
   */
  private tryStartInteraction(): boolean {
    const roll = Math.random();

    // The player pigeon is the most charming bird in the park: if it's within
    // range, nearby NPCs usually wander over to gather round it.
    const player = this.playerAnchor?.() ?? null;
    if (player) {
      const pd = Math.hypot(player.x - this.group.position.x, player.z - this.group.position.z);
      if (pd <= PLAYER_CHARM_RANGE && roll < PLAYER_APPROACH_CHANCE) {
        this.target = this.ringTarget(player.x, player.z, 1.0, PLAYER_GATHER_RADIUS);
        this.state = 'walk';
        return true;
      }
    }

    // Wander over to congregate around the person on the bench.
    const anchor = this.personAnchor?.() ?? null;
    if (anchor && roll < 0.35) {
      this.target = this.ringTarget(anchor.x, anchor.z, 1.2, NPC_PERSON_GATHER_RADIUS);
      this.state = 'walk';
      return true;
    }

    // Or drift over to huddle with the rest of the flock.
    if (roll < 0.6) {
      const centre = this.flockCentre();
      if (centre) {
        this.target = this.ringTarget(centre.x, centre.z, 0.8, 2.2);
        this.state = 'walk';
        return true;
      }
    }

    // Otherwise look for the nearest bird to chase or squabble with.
    let nearest: Npc | null = null;
    let nearestDist = Infinity;
    for (const other of this.flock) {
      if (other === this || other.isBusy()) continue;
      const dx = other.group.position.x - this.group.position.x;
      const dz = other.group.position.z - this.group.position.z;
      const d = Math.hypot(dx, dz);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = other;
      }
    }
    if (!nearest) return false;

    // A squabble breaks out when two birds are almost touching.
    if (nearestDist <= NPC_FIGHT_RANGE) {
      this.startFight(nearest);
      nearest.startFight(this);
      return true;
    }

    // Otherwise give chase if the other bird is within sight.
    if (nearestDist <= NPC_CHASE_RANGE) {
      this.chaseTarget = nearest;
      this.state = 'chase';
      this.timer = rand(1.5, 3.5);
      nearest.startFlee(this);
      return true;
    }

    return false;
  }

  /** Enter the fleeing state, running away from the given chaser. */
  private startFlee(from: Npc): void {
    this.fleeOrigin = from.group.position;
    this.state = 'flee';
    this.timer = rand(1.2, 2.6);
  }

  /** Enter the fighting state, squaring up against the given partner. */
  private startFight(partner: Npc): void {
    this.fightPartner = partner;
    this.state = 'fight';
    this.timer = rand(1.0, 2.2);
    this.fightPhase = 0;
  }

  /** Chase the target bird until caught or the chase times out. */
  private updateChase(delta: number): void {
    const target = this.chaseTarget;
    this.timer -= delta;
    if (!target || this.timer <= 0) {
      this.chaseTarget = null;
      this.endInteraction();
      return;
    }
    const dx = target.group.position.x - this.group.position.x;
    const dz = target.group.position.z - this.group.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.5) {
      // Caught up — the chase fizzles out.
      this.chaseTarget = null;
      this.endInteraction();
      return;
    }
    this.strut(dx, dz, dist, this.speed + 1.4, delta);
  }

  /** Scurry directly away from the flee origin, steering back inside the park. */
  private updateFlee(delta: number): void {
    const origin = this.fleeOrigin;
    this.timer -= delta;
    if (!origin || this.timer <= 0) {
      this.fleeOrigin = null;
      this.endInteraction();
      return;
    }
    let dx = this.group.position.x - origin.x;
    let dz = this.group.position.z - origin.z;
    const dist = Math.hypot(dx, dz) || 1;
    dx /= dist;
    dz /= dist;

    // Near the edge, curve back toward the centre so it doesn't run off.
    const px = this.group.position.x + dx;
    const pz = this.group.position.z + dz;
    if (Math.hypot(px, pz) > GROUND_RADIUS - 2) {
      dx = -this.group.position.x;
      dz = -this.group.position.z;
      const b = Math.hypot(dx, dz) || 1;
      dx /= b;
      dz /= b;
    }
    this.strut(dx, dz, 1, this.speed + 1.6, delta);
  }

  /** Flutter and jostle against the fight partner for a short scuffle. */
  private updateFight(delta: number): void {
    const partner = this.fightPartner;
    this.timer -= delta;
    if (!partner || this.timer <= 0) {
      this.fightPartner = null;
      this.endInteraction();
      return;
    }
    const { group, inner } = this;
    const dx = partner.group.position.x - group.position.x;
    const dz = partner.group.position.z - group.position.z;
    this.targetHeading = Math.atan2(dx, dz);

    // Rapid, agitated hopping and wing-beating during the squabble.
    this.fightPhase += delta * 22;
    group.position.y = Math.abs(Math.sin(this.fightPhase)) * 0.18;
    inner.rotation.x = Math.sin(this.fightPhase * 0.5) * 0.35;
    inner.rotation.z = Math.sin(this.fightPhase) * 0.25;
  }

  /** Reset pose after a social interaction and drop back into the idle loop. */
  private endInteraction(): void {
    this.inner.rotation.z = 0;
    this.group.position.y = 0;
    this.state = 'idle';
    this.timer = rand(0.6, 2);
    this.socialTimer = rand(3, 6);
  }

  /** Coo now and then, with a little pitch variation for character. */
  private updateCoo(delta: number): void {
    if (!this.coo) return;
    this.cooTimer -= delta;
    if (this.cooTimer <= 0) {
      if (!this.coo.isPlaying && this.coo.context.state === 'running') {
        this.coo.setPlaybackRate(rand(0.9, 1.15));
        this.coo.play();
      }
      this.cooTimer = rand(COO_MIN_INTERVAL, COO_MAX_INTERVAL);
    }
  }

  /** Head straight for the nearest rice grain and peck it up. */
  private seekFood(grain: { x: number; z: number; id: number }, delta: number): void {
    const { group, inner } = this;

    // Pause to peck while swallowing a grain.
    if (this.eatTimer > 0) {
      this.eatTimer -= delta;
      group.position.y = 0;
      this.peckPhase += delta * 9;
      inner.rotation.x = Math.max(0, Math.sin(this.peckPhase)) * 0.5;
      return;
    }

    const dx = grain.x - group.position.x;
    const dz = grain.z - group.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist <= RICE_EAT_DISTANCE) {
      this.targetHeading = Math.atan2(dx, dz);
      this.food?.eat(grain.id);
      this.eatTimer = 0.35;
      this.peckPhase = 0;
      // Re-plan a wander target for when the food runs out.
      this.state = 'idle';
      this.timer = rand(0.4, 1.5);
    } else {
      this.strut(dx, dz, dist, this.speed + 0.8, delta); // hurry toward food
    }
  }
}
