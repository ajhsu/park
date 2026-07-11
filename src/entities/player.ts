import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GROUND_RADIUS, MODEL_FORWARD_OFFSET, MOVE_SPEED, TURN_SPEED } from '../config';
import type { MovementInput } from '../input/movement';
import type { PigeonModel } from './pigeonModel';

/**
 * The player-controlled pigeon: camera-relative movement (keyboard or the
 * touch joystick), turning to face its heading, with the camera and orbit
 * target following along.
 */
export class Player {
  readonly pivot: THREE.Group;

  private targetHeading = 0;

  private readonly moveVec = new THREE.Vector3();
  private readonly camForward = new THREE.Vector3();
  private readonly camRight = new THREE.Vector3();
  private readonly worldUp = new THREE.Vector3(0, 1, 0);

  constructor(
    scene: THREE.Scene,
    private readonly camera: THREE.PerspectiveCamera,
    private readonly controls: OrbitControls,
    private readonly input: MovementInput,
    model: PigeonModel,
  ) {
    this.pivot = new THREE.Group();
    this.pivot.scale.setScalar(model.scale);
    this.pivot.add(model.proto);
    scene.add(this.pivot);
  }

  update(delta: number): void {
    const { pivot, camera, controls, moveVec, camForward, camRight, worldUp } = this;

    // Horizontal camera basis vectors.
    camera.getWorldDirection(camForward);
    camForward.y = 0;
    camForward.normalize();
    camRight.crossVectors(camForward, worldUp).normalize();

    const { forward, strafe } = this.input.read();
    const inputMag = Math.min(1, Math.hypot(forward, strafe));

    if (inputMag > 0.001) {
      moveVec.set(0, 0, 0);
      moveVec.addScaledVector(camForward, forward);
      moveVec.addScaledVector(camRight, strafe);
      moveVec.normalize();

      // Turn the pigeon to face where it's walking.
      this.targetHeading = Math.atan2(moveVec.x, moveVec.z) + MODEL_FORWARD_OFFSET;

      // Remember where we started so the camera follows the real displacement.
      const prevX = pivot.position.x;
      const prevZ = pivot.position.z;

      // Analog input scales speed (partial tilt walks slower).
      const step = MOVE_SPEED * inputMag * delta;
      pivot.position.addScaledVector(moveVec, step);

      // Clamp to the ground disc.
      const r = Math.hypot(pivot.position.x, pivot.position.z);
      if (r > GROUND_RADIUS) {
        pivot.position.x *= GROUND_RADIUS / r;
        pivot.position.z *= GROUND_RADIUS / r;
      }

      // Move the camera by the pigeon's actual displacement (respects clamping).
      camera.position.x += pivot.position.x - prevX;
      camera.position.z += pivot.position.z - prevZ;
    }

    // Smoothly rotate the pigeon toward its heading (shortest path).
    let diff = this.targetHeading - pivot.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    pivot.rotation.y += diff * Math.min(1, TURN_SPEED * delta);

    controls.target.set(pivot.position.x, 0.5, pivot.position.z);
  }
}
