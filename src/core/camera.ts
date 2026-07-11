import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/** Create the perspective camera used to view the park. */
export function createCamera(aspect: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 200);
  camera.position.set(3, 2.2, 5);
  return camera;
}

/** Create orbit controls that follow the pigeon and let the user look around. */
export function createControls(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement,
): OrbitControls {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 1.5;
  controls.maxDistance = 20;
  controls.maxPolarAngle = Math.PI / 2 - 0.04; // don't dip below the ground
  controls.target.set(0, 0.5, 0);
  return controls;
}
