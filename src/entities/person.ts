import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  PERSON_FACING,
  PERSON_HEIGHT,
  PERSON_MODEL_URL,
  PERSON_MODEL_YAW_OFFSET,
  PERSON_POSITION,
  PERSON_SEAT_Y,
  PERSON_SIT_CLIP,
  RICE_FEED_DISTANCE,
} from '../config';

/**
 * The seated person on the bench. Uses Quaternius' rigged "Man" (CC0) and
 * plays its built-in sitting animation. Exposes the ground point in front of
 * the person where fed rice should land.
 */
export class Person {
  /** World point just in front of the person where rice is scattered. */
  readonly feedPoint: THREE.Vector3;

  private constructor(
    readonly group: THREE.Group,
    private readonly mixer: THREE.AnimationMixer,
  ) {
    this.feedPoint = new THREE.Vector3(
      PERSON_POSITION.x + Math.sin(PERSON_FACING) * RICE_FEED_DISTANCE,
      0,
      PERSON_POSITION.z + Math.cos(PERSON_FACING) * RICE_FEED_DISTANCE,
    );
  }

  static load(scene: THREE.Scene): Promise<Person> {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        PERSON_MODEL_URL,
        (gltf) => {
          const model = gltf.scene;
          model.traverse((node) => {
            if ((node as THREE.Mesh).isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
            }
          });

          // A skinned mesh's geometry bounds are unreliable, so measure the
          // real standing height from the skeleton bones instead.
          model.updateMatrixWorld(true);
          let minY = Infinity;
          let maxY = -Infinity;
          const p = new THREE.Vector3();
          model.traverse((node) => {
            if ((node as THREE.Bone).isBone) {
              node.getWorldPosition(p);
              minY = Math.min(minY, p.y);
              maxY = Math.max(maxY, p.y);
            }
          });
          const height = maxY - minY;
          const scale = height > 0.0001 ? PERSON_HEIGHT / height : 1;

          const group = new THREE.Group();
          group.add(model);
          group.scale.setScalar(scale);
          group.position.set(PERSON_POSITION.x, PERSON_SEAT_Y, PERSON_POSITION.z);
          group.rotation.y = PERSON_FACING + PERSON_MODEL_YAW_OFFSET;
          scene.add(group);

          const mixer = new THREE.AnimationMixer(model);
          const sitting =
            gltf.animations.find((c) => c.name.includes(PERSON_SIT_CLIP)) ?? gltf.animations[0];
          if (sitting) {
            // Play the sit-down once and hold the final seated pose.
            const action = mixer.clipAction(sitting);
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
            action.play();
            // Jump straight to the end so the person starts already seated.
            mixer.setTime(sitting.duration);
          }

          // With the seated pose applied, drop the person so their feet rest
          // on the ground (plus an optional nudge), independent of the clip.
          group.updateMatrixWorld(true);
          const wp = new THREE.Vector3();
          let footY = Infinity;
          model.traverse((node) => {
            if ((node as THREE.Bone).isBone) {
              node.getWorldPosition(wp);
              footY = Math.min(footY, wp.y);
            }
          });
          group.position.y += PERSON_SEAT_Y - footY;

          resolve(new Person(group, mixer));
        },
        undefined,
        (err) => reject(err),
      );
    });
  }

  setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  update(delta: number): void {
    this.mixer.update(delta);
  }
}
