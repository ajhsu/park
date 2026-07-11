/** Central configuration: tunable constants and the colour palette. */

/** Remote low-poly pigeon model ("Mourning dove" by Poly by Google, CC-BY via Poly Pizza). */
export const MODEL_URL = 'https://static.poly.pizza/07e6ba2c-4b92-4f61-a9d5-cded49b8298c.glb';

/** Target size (largest bounding-box dimension) the loaded pigeon is scaled to. */
export const PIGEON_TARGET_SIZE = 1.1;

/** Player movement tuning. */
export const MOVE_SPEED = 4.0; // world units per second
export const TURN_SPEED = 10; // how quickly the pigeon rotates toward its heading
export const MODEL_FORWARD_OFFSET = 0; // aligns the model's nose with its travel direction
export const GROUND_RADIUS = 13; // how far a pigeon can roam across the park

/** Number of wandering NPC pigeons to spawn. */
export const NPC_COUNT = 6;

/** Colour palette shared across the scene. */
export const COLORS = {
  sky: 0x9cc7e6,
  hemiSky: 0xbfe3ff,
  hemiGround: 0x4a5a3a,
  keyLight: 0xfff2d8,
  fillLight: 0x9fb8ff,
  grass: 0x5f9e4a,
  plaza: 0xcdb894,
  path: 0xc2ad86,
  pond: 0x3d7fb5,
  pondRim: 0x8f8163,
  trunk: 0x7a5230,
  leaves: [0x3f8f3a, 0x4fa24a, 0x357a33],
  benchWood: 0x8a5a2b,
  benchLeg: 0x444444,
  lampPole: 0x2b2f36,
  lampHead: 0xfff2c0,
  lampEmissive: 0xffdf8a,
} as const;
