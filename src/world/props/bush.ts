import * as THREE from 'three';
import type { CollisionWorld } from '../collision';
import type { ParkMaterials } from '../materials';

/** A single rounded bush. */
export function makeBush(
  park: THREE.Group,
  mat: ParkMaterials,
  x: number,
  z: number,
  scale: number,
  world: CollisionWorld,
): void {
  const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), mat.leaves[1]);
  bush.position.set(x, 0.45 * scale, z);
  bush.scale.setScalar(scale);
  bush.castShadow = true;
  bush.receiveShadow = true;
  park.add(bush);
  world.addObstacle(x, z, 0.5 * scale);
}
