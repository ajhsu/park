import * as THREE from 'three';
import type { ParkMaterials } from '../materials';

/** A single flower: a thin stem, a petal blob and a bright centre. */
function makeFlower(park: THREE.Group, mat: ParkMaterials, x: number, z: number): void {
  const flower = new THREE.Group();
  const h = 0.35 + Math.random() * 0.25;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, h, 5), mat.stem);
  stem.position.y = h / 2;
  flower.add(stem);

  const petalMat = mat.flowers[(Math.random() * mat.flowers.length) | 0];
  const petals = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 0), petalMat);
  petals.position.y = h;
  petals.scale.y = 0.6;
  flower.add(petals);

  const center = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), mat.flowerCenter);
  center.position.y = h + 0.02;
  flower.add(center);

  flower.position.set(x, 0, z);
  flower.rotation.y = Math.random() * Math.PI * 2;
  park.add(flower);
}

/** A small cluster of flowers scattered around a point. */
export function makeFlowerBed(
  park: THREE.Group,
  mat: ParkMaterials,
  cx: number,
  cz: number,
  count = 7,
  spread = 1.1,
): void {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * spread;
    makeFlower(park, mat, cx + Math.cos(a) * r, cz + Math.sin(a) * r);
  }
}
