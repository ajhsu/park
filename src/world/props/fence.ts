import * as THREE from 'three';
import type { ParkMaterials } from '../materials';

/** A ring of short wooden fence posts marking the park boundary. */
export function makeFence(park: THREE.Group, mat: ParkMaterials, radius: number, posts = 40): void {
  const postGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.9, 6);
  for (let i = 0; i < posts; i++) {
    const a = (i / posts) * Math.PI * 2;
    const post = new THREE.Mesh(postGeo, mat.fencePost);
    post.position.set(Math.cos(a) * radius, 0.45, Math.sin(a) * radius);
    post.castShadow = true;
    park.add(post);
  }
}
