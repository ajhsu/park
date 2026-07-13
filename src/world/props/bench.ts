import * as THREE from 'three';
import type { CollisionWorld } from '../collision';
import type { ParkMaterials } from '../materials';

/** A park bench: slatted seat + back on four metal legs, facing `rotationY`. */
export function makeBench(
  park: THREE.Group,
  mat: ParkMaterials,
  x: number,
  z: number,
  rotationY: number,
  world: CollisionWorld,
): void {
  const bench = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.5), mat.benchWood);
  seat.position.y = 0.45;
  seat.castShadow = true;
  bench.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.1), mat.benchWood);
  back.position.set(0, 0.72, -0.2);
  back.castShadow = true;
  bench.add(back);
  const legSpots: [number, number][] = [
    [-0.7, 0.2],
    [0.7, 0.2],
    [-0.7, -0.2],
    [0.7, -0.2],
  ];
  legSpots.forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.1), mat.benchLeg);
    leg.position.set(lx, 0.22, lz);
    leg.castShadow = true;
    bench.add(leg);
  });
  bench.position.set(x, 0, z);
  bench.rotation.y = rotationY;
  park.add(bench);

  // Approximate the long seat with a few circles spaced along its length.
  const cos = Math.cos(rotationY);
  const sin = Math.sin(rotationY);
  for (const lx of [-0.5, 0, 0.5]) {
    world.addObstacle(x + lx * cos, z - lx * sin, 0.38);
  }
}
