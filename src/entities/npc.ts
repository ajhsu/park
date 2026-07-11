import * as THREE from 'three';
import {
  COO_MAX_INTERVAL,
  COO_MIN_INTERVAL,
  COO_REF_DISTANCE,
  COO_VOLUME,
  GROUND_RADIUS,
  NPC_COUNT,
} from '../config';
import type { PigeonModel } from './pigeonModel';

type NpcMode = 'walk' | 'idle';

interface WanderTarget {
  x: number;
  z: number;
}

/** Shared audio resources needed for an NPC to coo in 3D space. */
export interface NpcAudio {
  listener: THREE.AudioListener;
  cooBuffer: AudioBuffer;
}

const rand = (a: number, b: number): number => a + Math.random() * (b - a);

/** A random spot on the ground, kept a little inside the roam radius. */
function randomWanderTarget(): WanderTarget {
  const a = Math.random() * Math.PI * 2;
  const r = rand(2, GROUND_RADIUS - 2);
  return { x: Math.cos(a) * r, z: Math.sin(a) * r };
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

  constructor(scene: THREE.Scene, model: PigeonModel, audio?: NpcAudio) {
    this.inner = model.proto.clone(true);
    this.inner.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

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
  }

  update(delta: number): void {
    const { group, inner } = this;

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
        this.targetHeading = Math.atan2(dx, dz);
        const step = Math.min(this.speed * delta, dist);
        group.position.x += (dx / dist) * step;
        group.position.z += (dz / dist) * step;

        // Characteristic head-bob + gentle body bob while strutting.
        this.bobPhase += delta * this.speed * 9;
        inner.rotation.x = Math.sin(this.bobPhase) * 0.12;
        group.position.y = Math.abs(Math.sin(this.bobPhase)) * 0.04;
      }
    } else {
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

      if (this.timer <= 0) {
        this.target = randomWanderTarget();
        this.state = 'walk';
      }
    }

    // Smoothly rotate toward the desired heading (shortest path).
    let diff = this.targetHeading - group.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    group.rotation.y += diff * Math.min(1, 6 * delta);

    // Coo now and then, with a little pitch variation for character.
    if (this.coo) {
      this.cooTimer -= delta;
      if (this.cooTimer <= 0) {
        if (!this.coo.isPlaying && this.coo.context.state === 'running') {
          this.coo.setPlaybackRate(rand(0.9, 1.15));
          this.coo.play();
        }
        this.cooTimer = rand(COO_MIN_INTERVAL, COO_MAX_INTERVAL);
      }
    }
  }
}

/** Spawn the configured number of wandering NPC pigeons. */
export function spawnNpcs(
  scene: THREE.Scene,
  model: PigeonModel,
  audio?: NpcAudio,
  count = NPC_COUNT,
): Npc[] {
  const npcs: Npc[] = [];
  for (let i = 0; i < count; i++) {
    npcs.push(new Npc(scene, model, audio));
  }
  return npcs;
}
