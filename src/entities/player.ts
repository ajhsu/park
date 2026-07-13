import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  COO_REF_DISTANCE,
  COO_VOLUME,
  GROUND_RADIUS,
  MODEL_FORWARD_OFFSET,
  MOVE_SPEED,
  PIGEON_COLLISION_RADIUS,
  PLAYER_COO_DURATION,
  PLAYER_FIGHT_DURATION,
  TURN_SPEED,
} from '../config';
import type { MovementInput } from '../input/movement';
import { type CollisionAgent, type CollisionWorld } from '../world/collision';
import { shortestAngle } from '../utils/math';
import type { PigeonModel } from './pigeonModel';

/**
 * The player-controlled pigeon: camera-relative movement (keyboard or the
 * touch joystick), turning to face its heading, with the camera and orbit
 * target following along.
 */
export class Player {
  readonly pivot: THREE.Group;
  private readonly inner: THREE.Object3D;

  private targetHeading = 0;
  private bobPhase = 0;

  // Transient action display ('coo' = friendly, 'fight' = aggressive).
  private action: 'none' | 'coo' | 'fight' = 'none';
  private actionTimer = 0;
  private actionPhase = 0;
  private cooSound: THREE.PositionalAudio | null = null;

  private readonly moveVec = new THREE.Vector3();
  private readonly camForward = new THREE.Vector3();
  private readonly camRight = new THREE.Vector3();
  private readonly worldUp = new THREE.Vector3(0, 1, 0);

  private readonly agent: CollisionAgent;

  constructor(
    scene: THREE.Scene,
    private readonly camera: THREE.PerspectiveCamera,
    private readonly controls: OrbitControls,
    private readonly input: MovementInput,
    model: PigeonModel,
    private readonly world: CollisionWorld,
  ) {
    this.pivot = new THREE.Group();
    this.pivot.scale.setScalar(model.scale);

    // Keep the model on an inner object so it can be tilted for the walking
    // head-bob without disturbing the pivot's heading rotation.
    this.inner = model.proto;
    this.pivot.add(this.inner);

    scene.add(this.pivot);

    // Take part in collision so other pigeons and objects can't overlap us.
    this.agent = { position: this.pivot.position, radius: PIGEON_COLLISION_RADIUS };
    this.world.addAgent(this.agent);
  }

  /** Attach a positional coo so the player pigeon can call out when it coos. */
  enableCoo(listener: THREE.AudioListener, buffer: AudioBuffer): void {
    const sound = new THREE.PositionalAudio(listener);
    sound.setBuffer(buffer);
    sound.setRefDistance(COO_REF_DISTANCE);
    sound.setRolloffFactor(1.4);
    sound.setVolume(COO_VOLUME);
    this.pivot.add(sound);
    this.cooSound = sound;
  }

  /** True while a coo/fight display is playing (used to debounce triggers). */
  get isActing(): boolean {
    return this.action !== 'none';
  }

  /** Friendly coo display: a gentle throat-puff and upward bob, plus a call. */
  coo(): void {
    if (this.action !== 'none') return;
    this.action = 'coo';
    this.actionTimer = PLAYER_COO_DURATION;
    this.actionPhase = 0;
    const sound = this.cooSound;
    if (sound && !sound.isPlaying && sound.context.state === 'running') {
      sound.setPlaybackRate(0.95 + Math.random() * 0.2);
      sound.play();
    }
  }

  /** Aggressive fight display: a lunge with agitated wing-beats and hopping. */
  fight(): void {
    if (this.action !== 'none') return;
    this.action = 'fight';
    this.actionTimer = PLAYER_FIGHT_DURATION;
    this.actionPhase = 0;
  }

  /** Drive the current action's pose; returns true while one is playing. */
  private updateAction(delta: number): boolean {
    if (this.action === 'none') return false;
    const { inner, pivot } = this;
    this.actionTimer -= delta;
    this.actionPhase += delta;
    const t = this.actionPhase;

    if (this.action === 'coo') {
      // Puff up and tip the head back with a soft repeated coo-bob.
      inner.rotation.x = -Math.abs(Math.sin(t * 6)) * 0.22;
      inner.rotation.z = 0;
      pivot.position.y = Math.abs(Math.sin(t * 6)) * 0.03;
    } else {
      // Agitated lunging, wing-rocking and hopping for the fight display.
      inner.rotation.x = Math.sin(t * 20) * 0.3;
      inner.rotation.z = Math.sin(t * 26) * 0.35;
      pivot.position.y = Math.abs(Math.sin(t * 18)) * 0.16;
    }

    if (this.actionTimer <= 0) {
      this.action = 'none';
      inner.rotation.x = 0;
      inner.rotation.z = 0;
      pivot.position.y = 0;
    }
    return true;
  }

  update(delta: number): void {
    const { pivot, inner, camera, controls, moveVec, camForward, camRight, worldUp } = this;

    // Horizontal camera basis vectors.
    camera.getWorldDirection(camForward);
    camForward.y = 0;
    camForward.normalize();
    camRight.crossVectors(camForward, worldUp).normalize();

    const { forward, strafe } = this.input.read();
    const inputMag = Math.min(1, Math.hypot(forward, strafe));

    // Remember where we started so the camera follows the pigeon's real
    // displacement this frame (including any nudge from collision below).
    const prevX = pivot.position.x;
    const prevZ = pivot.position.z;

    if (inputMag > 0.001) {
      moveVec.set(0, 0, 0);
      moveVec.addScaledVector(camForward, forward);
      moveVec.addScaledVector(camRight, strafe);
      moveVec.normalize();

      // Turn the pigeon to face where it's walking.
      this.targetHeading = Math.atan2(moveVec.x, moveVec.z) + MODEL_FORWARD_OFFSET;

      // Analog input scales speed (partial tilt walks slower).
      const step = MOVE_SPEED * inputMag * delta;
      pivot.position.addScaledVector(moveVec, step);

      // Characteristic head-bob + gentle body bob while strutting, like the NPCs.
      this.bobPhase += delta * MOVE_SPEED * inputMag * 3.2;
      inner.rotation.x = Math.sin(this.bobPhase) * 0.12;
      pivot.position.y = Math.abs(Math.sin(this.bobPhase)) * 0.05;
    } else {
      // Settle back to a neutral standing pose when stopped.
      const ease = Math.min(1, 8 * delta);
      inner.rotation.x += (0 - inner.rotation.x) * ease;
      pivot.position.y += (0 - pivot.position.y) * ease;
    }

    // A coo/fight display overrides the walking/standing pose while it plays.
    this.updateAction(delta);

    // Don't walk through benches, trees, the person or other pigeons.
    this.world.resolveStatic(pivot.position, PIGEON_COLLISION_RADIUS);
    this.world.resolveAgents(this.agent);

    // Clamp to the ground disc after any collision push.
    const r = Math.hypot(pivot.position.x, pivot.position.z);
    if (r > GROUND_RADIUS) {
      pivot.position.x *= GROUND_RADIUS / r;
      pivot.position.z *= GROUND_RADIUS / r;
    }

    // Move the camera by the pigeon's actual displacement (respects clamping
    // and collision).
    camera.position.x += pivot.position.x - prevX;
    camera.position.z += pivot.position.z - prevZ;

    // Smoothly rotate the pigeon toward its heading (shortest path).
    pivot.rotation.y +=
      shortestAngle(this.targetHeading, pivot.rotation.y) * Math.min(1, TURN_SPEED * delta);

    controls.target.set(pivot.position.x, 0.5, pivot.position.z);
  }
}
