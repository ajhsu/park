import * as THREE from 'three';
import type { CollisionWorld } from '../collision';
import type { ParkMaterials } from '../materials';

/** A squat rock with a little random rotation for variety. */
export function makeRock(
  park: THREE.Group,
  mat: ParkMaterials,
  x: number,
  z: number,
  scale: number,
  world: CollisionWorld,
): void {
  const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 0), mat.rock);
  rock.position.set(x, 0.18 * scale, z);
  rock.scale.set(scale, scale * 0.7, scale);
  rock.rotation.set(Math.random(), Math.random() * Math.PI * 2, Math.random());
  rock.castShadow = true;
  rock.receiveShadow = true;
  park.add(rock);
  world.addObstacle(x, z, 0.4 * scale);
}
