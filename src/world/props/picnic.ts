import * as THREE from 'three';
import type { ParkMaterials } from '../materials';

/** A checkered picnic blanket with a couple of stripes and a little basket. */
export function makePicnic(park: THREE.Group, mat: ParkMaterials, x: number, z: number): void {
  const picnic = new THREE.Group();
  const blanket = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2, 4, 4), mat.blanket);
  blanket.rotation.x = -Math.PI / 2;
  blanket.position.y = 0.02;
  blanket.receiveShadow = true;
  picnic.add(blanket);

  // A couple of stripes for a checkered feel.
  for (const off of [-0.55, 0.55]) {
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.35), mat.blanketStripe);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(0, 0.025, off);
    picnic.add(stripe);
  }

  // A little basket.
  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.3, 12), mat.basket);
  basket.position.set(0.6, 0.17, 0.4);
  basket.castShadow = true;
  picnic.add(basket);

  picnic.position.set(x, 0, z);
  picnic.rotation.y = Math.random() * Math.PI * 2;
  park.add(picnic);
}
