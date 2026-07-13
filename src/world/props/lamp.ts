import * as THREE from 'three';
import type { CollisionWorld } from '../collision';
import type { ParkMaterials } from '../materials';

/** A lamppost: a tall metal pole topped with a glowing lamp head. */
export function makeLamp(
  park: THREE.Group,
  mat: ParkMaterials,
  x: number,
  z: number,
  world: CollisionWorld,
): void {
  const lamp = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3, 10), mat.lampPole);
  pole.position.y = 1.5;
  pole.castShadow = true;
  lamp.add(pole);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), mat.lampHead);
  head.position.y = 3.05;
  lamp.add(head);
  lamp.position.set(x, 0, z);
  park.add(lamp);
  world.addObstacle(x, z, 0.25);
}
