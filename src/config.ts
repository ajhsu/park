/** Central configuration: tunable constants and the colour palette. */

/** Remote low-poly pigeon model ("Mourning dove" by Poly by Google, CC-BY via Poly Pizza). */
export const MODEL_URL = 'https://static.poly.pizza/07e6ba2c-4b92-4f61-a9d5-cded49b8298c.glb';

/** Target size (largest bounding-box dimension) the loaded pigeon is scaled to. */
export const PIGEON_TARGET_SIZE = 0.55;

/** Player movement tuning. */
export const MOVE_SPEED = 4.0; // world units per second
export const TURN_SPEED = 10; // how quickly the pigeon rotates toward its heading
export const MODEL_FORWARD_OFFSET = 0; // aligns the model's nose with its travel direction
export const GROUND_RADIUS = 28; // how far a pigeon can roam across the park

/** Number of wandering NPC pigeons to spawn. */
export const NPC_COUNT = 14;

/** NPC social behaviour tuning. */
export const NPC_GATHER_RANGE = 10; // radius within which flock-mates count as "nearby"
export const NPC_CHASE_RANGE = 6; // how close another pigeon must be to trigger a chase
export const NPC_FIGHT_RANGE = 1.4; // how close two pigeons must be to squabble
export const NPC_PERSON_GATHER_RADIUS = 2.8; // ring radius pigeons gather in around the person

/**
 * Player "charm": the player pigeon is more magnetic than its flock-mates, so
 * nearby NPCs notice it sooner and prefer to wander over and gather round it.
 */
export const PLAYER_CHARM_RANGE = 13; // radius within which NPCs are drawn to the player
export const PLAYER_GATHER_RADIUS = 2.4; // ring radius NPCs gather in around the player
export const PLAYER_APPROACH_CHANCE = 0.75; // chance an in-range NPC chooses to approach the player

/** NPC cooing (3D positional audio) tuning. */
export const COO_MIN_INTERVAL = 30; // seconds — shortest gap between an NPC's coos
export const COO_MAX_INTERVAL = 120; // seconds — longest gap between an NPC's coos
export const COO_VOLUME = 1.6; // per-pigeon coo volume
export const COO_REF_DISTANCE = 6; // distance at which the coo is at full volume

/** Person (Quaternius "Man", CC0 via Poly Pizza) seated on a bench feeding the pigeons. */
export const PERSON_MODEL_URL = 'https://static.poly.pizza/3746be88-6799-4817-929b-6bc067c47caa.glb';
export const PERSON_SIT_CLIP = 'Man_Sitting'; // animation clip name (matches "…|Man_Sitting")
export const PERSON_HEIGHT = 1.7; // target standing height in world units (for scaling)
export const PERSON_POSITION = { x: 0, z: -4.32 }; // seated on the south bench (butt on the seat, clear of the backrest)
export const PERSON_SEAT_Y = 0.05; // small lift so the person rests on top of the seat
export const PERSON_FACING = 0; // yaw so the person faces the plaza centre (+z)
export const PERSON_MODEL_YAW_OFFSET = 0; // aligns the model's front with PERSON_FACING

/** Rice feeding. */
export const RICE_PER_FEED = 16; // grains scattered per feed
export const RICE_SPREAD = 1.2; // scatter radius of a feed
export const RICE_FEED_DISTANCE = 1.8; // how far in front of the person the rice lands
export const RICE_SIZE = 0.018; // grain radius (small, like a real rice grain)
export const RICE_MAX = 200; // cap on simultaneous grains
export const RICE_EAT_DISTANCE = 0.35; // how close a pigeon must be to eat a grain

/** Simple ground-plane collision tuning (every collider is a circle in x/z). */
export const PIGEON_COLLISION_RADIUS = 0.22; // a pigeon's footprint on the ground
export const PERSON_COLLISION_RADIUS = 0.55; // the seated person's footprint

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
  rice: 0xf5f1e0,
  rock: 0x8b8f96,
  fountainStone: 0xc3c8d0,
  lilyPad: 0x2f7d4f,
  flowers: [0xff6f91, 0xffd166, 0xf25f5c, 0x9b5de5, 0xf7f7ff, 0xff8fab],
  flowerCenter: 0xffd23f,
  fencePost: 0x6b4a2b,
  blanket: 0xd45d5d,
  blanketStripe: 0xf2e3c6,
} as const;

