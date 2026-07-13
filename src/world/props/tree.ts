import * as THREE from 'three';
import type { CollisionWorld } from '../collision';
import type { ParkMaterials } from '../materials';

/** A low-poly tree: a tapered trunk topped with a cluster of leaf blobs. */
export function makeTree(
  park: THREE.Group,
  mat: ParkMaterials,
  x: number,
  z: number,
  scale: number,
  world: CollisionWorld,
): void {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 1.6, 8), mat.trunk);
  trunk.position.y = 0.8;
  trunk.castShadow = true;
  tree.add(trunk);

  const blobs = [
    { r: 1.1, y: 2.1, x: 0, z: 0 },
    { r: 0.85, y: 2.6, x: 0.6, z: 0.3 },
    { r: 0.8, y: 2.5, x: -0.6, z: -0.2 },
    { r: 0.75, y: 3.0, x: 0.1, z: -0.4 },
  ];
  blobs.forEach((b, i) => {
    const leaf = new THREE.Mesh(
      new THREE.IcosahedronGeometry(b.r, 1),
      mat.leaves[i % mat.leaves.length],
    );
    leaf.position.set(b.x, b.y, b.z);
    leaf.castShadow = true;
    tree.add(leaf);
  });

  tree.position.set(x, 0, z);
  tree.scale.setScalar(scale);
  park.add(tree);
  world.addObstacle(x, z, 0.45 * scale);
}
