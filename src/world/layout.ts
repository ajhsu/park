/**
 * Static placement data for the park. Keeping the "where things go" separate
 * from the "how things are built" (the prop builders) makes the layout easy to
 * tweak without touching any Three.js code.
 */

/** Centre of the pond; several props are positioned relative to it. */
export const POND_CENTER = { x: -18, z: -7 };

/** Trees: a dense outer belt plus a few mid-ground clusters for depth. */
export const TREE_SPOTS: [number, number][] = [
  // Outer belt
  [22, 0],
  [19, 15],
  [12, 22],
  [0, 25],
  [-13, 21],
  [-21, 13],
  [-24, -3],
  [-20, -16],
  [-9, -23],
  [4, -24],
  [16, -19],
  [24, -9],
  // Mid-ground accents
  [13, 6],
  [-11, 9],
  [8, -12],
  [-14, -9],
  [15, -4],
  [-6, 15],
];

/** Bushes scattered between the plaza and the tree line. */
export const BUSH_SPOTS: [number, number][] = [
  [6, 2],
  [5.5, -4],
  [-5.5, 3],
  [-4.5, -5],
  [2, 6],
  [-2, -6],
  [8, 6],
  [-8, -2],
  [11, -8],
  [-12, 4],
  [9, 11],
  [-10, -12],
  [14, 2],
  [-15, 8],
];

/** Flower beds brightening the lawns and path spokes. */
export const FLOWER_BEDS: [number, number][] = [
  [7, 7],
  [-7, 6],
  [6, -8],
  [-8, -7],
  [12, 12],
  [-13, 11],
  [11, -13],
  [-12, -12],
  [0, 13],
  [13, 0],
];

/** Rocks dotted around the lawns and pond edge. */
export const ROCK_SPOTS: [number, number][] = [
  [16, 8],
  [-16, -5],
  [9, -16],
  [-10, 16],
  [20, -12],
  [-19, 6],
  [4, 18],
  [-3, -17],
];

/** Pond dressing: rocks around the rim (x, z, scale). */
export const POND_ROCKS: [number, number, number][] = [
  [POND_CENTER.x + 4.8, POND_CENTER.z + 1.5, 1.3],
  [POND_CENTER.x - 3.5, POND_CENTER.z - 4.2, 1.1],
  [POND_CENTER.x + 1.5, POND_CENTER.z - 5.0, 0.9],
];

/** Pond dressing: lily pads on the water (x, z, scale). */
export const POND_LILIES: [number, number, number][] = [
  [POND_CENTER.x + 1.4, POND_CENTER.z + 0.8, 1.1],
  [POND_CENTER.x - 1.8, POND_CENTER.z - 0.6, 0.9],
  [POND_CENTER.x + 0.2, POND_CENTER.z - 2.2, 1.0],
];

/** Fountain position (a second focal point). */
export const FOUNTAIN = { x: 15, z: 14 };

/** Picnic blanket position. */
export const PICNIC = { x: -13, z: 13 };

/** A bench placement: ground position plus facing yaw. */
export interface BenchPlacement {
  x: number;
  z: number;
  rotationY: number;
}

/** Benches facing the plaza (south bench seats the feeding person) + outer path. */
export const BENCHES: BenchPlacement[] = [
  { x: 0, z: 5.4, rotationY: Math.PI },
  { x: 0, z: -4.6, rotationY: 0 },
  { x: 5.4, z: 0, rotationY: -Math.PI / 2 },
  { x: -5.4, z: 0, rotationY: Math.PI / 2 },
  { x: 10, z: 10, rotationY: -Math.PI * 0.75 },
  { x: -10, z: 10, rotationY: Math.PI * 0.75 },
];

/** Lampposts on the inner path corners and out along the belt. */
export const LAMPS: [number, number][] = [
  [7.5, 7.5],
  [-7.5, 7.5],
  [7.5, -7.5],
  [-7.5, -7.5],
  [16, 0],
  [-16, 0],
  [0, 16],
  [0, -16],
];
