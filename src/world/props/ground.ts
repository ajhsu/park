import * as THREE from 'three';
import type { CollisionWorld } from '../collision';
import { POND_CENTER } from '../layout';
import type { ParkMaterials } from '../materials';

/**
 * Build the ground plane, sandy plaza, path ring + radial spokes and the pond
 * (with its stone rim), registering the pond as a collision obstacle.
 */
export function buildGround(park: THREE.Group, mat: ParkMaterials, world: CollisionWorld): void {
  // Grass ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), mat.grass);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  park.add(ground);

  // Central sandy plaza (kept open as the feeding area)
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(5, 48), mat.plaza);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.01;
  plaza.receiveShadow = true;
  park.add(plaza);

  // Pathway ring around the plaza
  const path = new THREE.Mesh(new THREE.RingGeometry(9, 10.6, 64), mat.path);
  path.rotation.x = -Math.PI / 2;
  path.position.y = 0.01;
  path.receiveShadow = true;
  park.add(path);

  // Radial garden paths reaching out toward the tree line
  for (let i = 0; i < 4; i++) {
    const spoke = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 10), mat.path);
    spoke.rotation.x = -Math.PI / 2;
    spoke.rotation.z = (i * Math.PI) / 2 + Math.PI / 4;
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    spoke.position.set(Math.cos(a) * 14.8, 0.008, Math.sin(a) * 14.8);
    spoke.receiveShadow = true;
    park.add(spoke);
  }

  // Pond (off to one side) with a stone rim
  const pond = new THREE.Mesh(new THREE.CircleGeometry(4.6, 56), mat.pond);
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(POND_CENTER.x, 0.02, POND_CENTER.z);
  pond.receiveShadow = true;
  park.add(pond);

  const pondRim = new THREE.Mesh(new THREE.RingGeometry(4.6, 5.3, 56), mat.pondRim);
  pondRim.rotation.x = -Math.PI / 2;
  pondRim.position.set(POND_CENTER.x, 0.015, POND_CENTER.z);
  park.add(pondRim);

  // Keep pigeons off the water.
  world.addObstacle(POND_CENTER.x, POND_CENTER.z, 4.8);
}
