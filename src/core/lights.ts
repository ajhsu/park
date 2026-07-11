import * as THREE from 'three';
import { COLORS } from '../config';

/** Add ambient, key (shadow-casting) and fill lighting to the scene. */
export function addLights(scene: THREE.Scene): void {
  scene.add(new THREE.HemisphereLight(COLORS.hemiSky, COLORS.hemiGround, 1.0));

  const keyLight = new THREE.DirectionalLight(COLORS.keyLight, 2.4);
  keyLight.position.set(10, 16, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 60;
  keyLight.shadow.camera.left = -22;
  keyLight.shadow.camera.right = 22;
  keyLight.shadow.camera.top = 22;
  keyLight.shadow.camera.bottom = -22;
  keyLight.shadow.bias = -0.0002;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(COLORS.fillLight, 0.5);
  fillLight.position.set(-8, 4, -6);
  scene.add(fillLight);
}
