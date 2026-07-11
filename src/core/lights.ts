import * as THREE from 'three';
import { COLORS } from '../config';

/** Add ambient, key (shadow-casting) and fill lighting to the scene. */
export function addLights(scene: THREE.Scene): void {
  scene.add(new THREE.HemisphereLight(COLORS.hemiSky, COLORS.hemiGround, 1.0));

  const keyLight = new THREE.DirectionalLight(COLORS.keyLight, 2.4);
  keyLight.position.set(20, 30, 16);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 110;
  keyLight.shadow.camera.left = -40;
  keyLight.shadow.camera.right = 40;
  keyLight.shadow.camera.top = 40;
  keyLight.shadow.camera.bottom = -40;
  keyLight.shadow.bias = -0.0002;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(COLORS.fillLight, 0.5);
  fillLight.position.set(-16, 8, -12);
  scene.add(fillLight);
}
