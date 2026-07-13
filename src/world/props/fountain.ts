import * as THREE from 'three';
import type { CollisionWorld } from '../collision';
import type { ParkMaterials } from '../materials';

/** A tiered stone fountain with basin water and a spouting top bowl. */
export function makeFountain(
  park: THREE.Group,
  mat: ParkMaterials,
  x: number,
  z: number,
  world: CollisionWorld,
): void {
  const fountain = new THREE.Group();

  // Outer basin wall + water.
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.5, 24), mat.fountainStone);
  basin.position.y = 0.25;
  basin.castShadow = true;
  basin.receiveShadow = true;
  fountain.add(basin);

  const water = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.42, 24), mat.fountainWater);
  water.position.y = 0.3;
  fountain.add(water);

  // Central pedestal with a smaller upper bowl.
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.5, 1.1, 16),
    mat.fountainStone,
  );
  pedestal.position.y = 0.9;
  pedestal.castShadow = true;
  fountain.add(pedestal);

  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.4, 0.28, 20), mat.fountainStone);
  bowl.position.y = 1.5;
  bowl.castShadow = true;
  fountain.add(bowl);

  const topWater = new THREE.Mesh(
    new THREE.CylinderGeometry(0.78, 0.78, 0.14, 20),
    mat.fountainWater,
  );
  topWater.position.y = 1.62;
  fountain.add(topWater);

  const spout = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), mat.fountainWater);
  spout.position.y = 1.8;
  fountain.add(spout);

  fountain.position.set(x, 0, z);
  park.add(fountain);
  world.addObstacle(x, z, 2.5);
}
