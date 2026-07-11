import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MODEL_URL, PIGEON_TARGET_SIZE } from '../config';

export interface PigeonModel {
  /** Normalized model: centred on x/z, sitting on the ground (y = 0). */
  proto: THREE.Object3D;
  /** Uniform scale to apply to a pivot group wrapping the model. */
  scale: number;
}

/**
 * Load the pigeon GLB, enable shadows, and normalize it so it is centred on
 * the ground and sized consistently. Resolves with the prototype + scale.
 */
export function loadPigeonModel(): Promise<PigeonModel> {
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      MODEL_URL,
      (gltf) => {
        const model = gltf.scene;

        model.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });

        // Center and scale the model to a consistent size.
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = PIGEON_TARGET_SIZE / maxDim;

        model.position.sub(center); // center at origin
        model.position.y += size.y / 2; // sit on the ground

        resolve({ proto: model, scale });
      },
      undefined,
      (err) => reject(err),
    );
  });
}
