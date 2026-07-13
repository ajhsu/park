import * as THREE from 'three';
import type { ParkMaterials } from '../materials';

/** A flat lily pad floating on the pond. */
export function makeLilyPad(
  park: THREE.Group,
  mat: ParkMaterials,
  x: number,
  z: number,
  scale: number,
): void {
  const pad = new THREE.Mesh(new THREE.CircleGeometry(0.35 * scale, 12), mat.lilyPad);
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(x, 0.03, z);
  park.add(pad);
}
