import * as THREE from 'three';
import { GROUND_RADIUS } from '../config';
import type { CollisionWorld } from './collision';
import {
  BENCHES,
  BUSH_SPOTS,
  FLOWER_BEDS,
  FOUNTAIN,
  LAMPS,
  PICNIC,
  POND_LILIES,
  POND_ROCKS,
  ROCK_SPOTS,
  TREE_SPOTS,
} from './layout';
import { createParkMaterials } from './materials';
import { buildGround } from './props/ground';
import { makeBench } from './props/bench';
import { makeBush } from './props/bush';
import { makeFence } from './props/fence';
import { makeFlowerBed } from './props/flower';
import { makeFountain } from './props/fountain';
import { makeLamp } from './props/lamp';
import { makeLilyPad } from './props/lilyPad';
import { makePicnic } from './props/picnic';
import { makeRock } from './props/rock';
import { makeTree } from './props/tree';

/**
 * Build the park environment (ground, plaza, path spokes, pond, fountain,
 * and scattered trees, bushes, flowers, rocks, benches, lampposts, a picnic
 * blanket and a boundary fence) and add it to the scene.
 *
 * Placement lives in `layout.ts`; each prop is built by a dedicated module in
 * `props/`. Static props register themselves with the collision world.
 */
export function buildPark(scene: THREE.Scene, world: CollisionWorld): THREE.Group {
  const park = new THREE.Group();
  scene.add(park);

  const mat = createParkMaterials();

  buildGround(park, mat, world);

  // Trees: a dense outer belt plus a few mid-ground clusters for depth.
  TREE_SPOTS.forEach(([x, z], i) => makeTree(park, mat, x, z, 0.9 + (i % 4) * 0.28, world));

  // Bushes scattered between the plaza and the tree line.
  BUSH_SPOTS.forEach(([x, z], i) => makeBush(park, mat, x, z, 0.9 + (i % 3) * 0.35, world));

  // Flower beds brightening the lawns and path spokes.
  FLOWER_BEDS.forEach(([x, z]) => makeFlowerBed(park, mat, x, z, 6 + ((Math.random() * 4) | 0)));

  // Rocks dotted around the lawns and pond edge.
  ROCK_SPOTS.forEach(([x, z], i) => makeRock(park, mat, x, z, 0.8 + (i % 3) * 0.5, world));

  // Pond dressing: rocks around the rim and lily pads on the water.
  POND_ROCKS.forEach(([x, z, scale]) => makeRock(park, mat, x, z, scale, world));
  POND_LILIES.forEach(([x, z, scale]) => makeLilyPad(park, mat, x, z, scale));

  // A decorative fountain as a second focal point.
  makeFountain(park, mat, FOUNTAIN.x, FOUNTAIN.z, world);

  // A picnic blanket tucked on the lawn.
  makePicnic(park, mat, PICNIC.x, PICNIC.z);

  // Benches facing the plaza (south bench seats the feeding person) + outer path.
  BENCHES.forEach(({ x, z, rotationY }) => makeBench(park, mat, x, z, rotationY, world));

  // Lampposts on the inner path corners and out along the belt.
  LAMPS.forEach(([x, z]) => makeLamp(park, mat, x, z, world));

  // Boundary fence around the park.
  makeFence(park, mat, GROUND_RADIUS + 1, 48);

  return park;
}
