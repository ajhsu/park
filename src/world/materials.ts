import * as THREE from 'three';
import { COLORS } from '../config';

/**
 * Shared park materials, created once and reused across every prop builder so
 * we don't allocate a fresh material per mesh. Grouped roughly by what uses them.
 */
export interface ParkMaterials {
  grass: THREE.MeshStandardMaterial;
  plaza: THREE.MeshStandardMaterial;
  path: THREE.MeshStandardMaterial;
  pond: THREE.MeshStandardMaterial;
  pondRim: THREE.MeshStandardMaterial;
  fountainWater: THREE.MeshStandardMaterial;
  fountainStone: THREE.MeshStandardMaterial;
  trunk: THREE.MeshStandardMaterial;
  leaves: THREE.MeshStandardMaterial[];
  rock: THREE.MeshStandardMaterial;
  stem: THREE.MeshStandardMaterial;
  flowers: THREE.MeshStandardMaterial[];
  flowerCenter: THREE.MeshStandardMaterial;
  benchWood: THREE.MeshStandardMaterial;
  benchLeg: THREE.MeshStandardMaterial;
  basket: THREE.MeshStandardMaterial;
  lampPole: THREE.MeshStandardMaterial;
  lampHead: THREE.MeshStandardMaterial;
  lilyPad: THREE.MeshStandardMaterial;
  blanket: THREE.MeshStandardMaterial;
  blanketStripe: THREE.MeshStandardMaterial;
  fencePost: THREE.MeshStandardMaterial;
}

/** Build the full set of shared park materials. */
export function createParkMaterials(): ParkMaterials {
  return {
    grass: new THREE.MeshStandardMaterial({ color: COLORS.grass, roughness: 1 }),
    plaza: new THREE.MeshStandardMaterial({ color: COLORS.plaza, roughness: 1 }),
    path: new THREE.MeshStandardMaterial({ color: COLORS.path, roughness: 1 }),
    pond: new THREE.MeshStandardMaterial({ color: COLORS.pond, roughness: 0.2, metalness: 0.2 }),
    pondRim: new THREE.MeshStandardMaterial({ color: COLORS.pondRim, roughness: 1 }),
    fountainWater: new THREE.MeshStandardMaterial({
      color: COLORS.pond,
      roughness: 0.15,
      metalness: 0.3,
    }),
    fountainStone: new THREE.MeshStandardMaterial({ color: COLORS.fountainStone, roughness: 0.8 }),
    trunk: new THREE.MeshStandardMaterial({ color: COLORS.trunk, roughness: 0.9 }),
    leaves: COLORS.leaves.map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.9 })),
    rock: new THREE.MeshStandardMaterial({ color: COLORS.rock, roughness: 0.95 }),
    stem: new THREE.MeshStandardMaterial({ color: COLORS.leaves[2], roughness: 0.9 }),
    flowers: COLORS.flowers.map(
      (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.7 }),
    ),
    flowerCenter: new THREE.MeshStandardMaterial({ color: COLORS.flowerCenter, roughness: 0.6 }),
    benchWood: new THREE.MeshStandardMaterial({ color: COLORS.benchWood, roughness: 0.8 }),
    benchLeg: new THREE.MeshStandardMaterial({
      color: COLORS.benchLeg,
      roughness: 0.6,
      metalness: 0.4,
    }),
    basket: new THREE.MeshStandardMaterial({ color: COLORS.benchWood, roughness: 0.9 }),
    lampPole: new THREE.MeshStandardMaterial({
      color: COLORS.lampPole,
      roughness: 0.5,
      metalness: 0.6,
    }),
    lampHead: new THREE.MeshStandardMaterial({
      color: COLORS.lampHead,
      emissive: COLORS.lampEmissive,
      emissiveIntensity: 1.2,
      roughness: 0.4,
    }),
    lilyPad: new THREE.MeshStandardMaterial({ color: COLORS.lilyPad, roughness: 0.7 }),
    blanket: new THREE.MeshStandardMaterial({ color: COLORS.blanket, roughness: 0.95 }),
    blanketStripe: new THREE.MeshStandardMaterial({ color: COLORS.blanketStripe, roughness: 0.95 }),
    fencePost: new THREE.MeshStandardMaterial({ color: COLORS.fencePost, roughness: 0.9 }),
  };
}
