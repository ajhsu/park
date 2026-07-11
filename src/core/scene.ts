import * as THREE from 'three';
import { COLORS } from '../config';

/** Create the scene with sky-blue background and distance fog. */
export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.sky);
  scene.fog = new THREE.Fog(COLORS.sky, 45, 105);
  return scene;
}
