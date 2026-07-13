import * as THREE from 'three';
import { NPC_COUNT } from '../../config';
import type { CollisionWorld } from '../../world/collision';
import type { FoodSource } from '../../world/rice';
import type { PigeonModel } from '../pigeonModel';
import { Npc, type GatherAnchor, type NpcAudio } from './Npc';

/** Spawn the configured number of wandering NPC pigeons and link them as a flock. */
export function spawnNpcs(
  scene: THREE.Scene,
  model: PigeonModel,
  world: CollisionWorld,
  audio?: NpcAudio,
  food?: FoodSource,
  personAnchor?: GatherAnchor,
  playerAnchor?: GatherAnchor,
  count = NPC_COUNT,
): Npc[] {
  const npcs: Npc[] = [];
  for (let i = 0; i < count; i++) {
    npcs.push(new Npc(scene, model, world, audio, food, personAnchor, playerAnchor));
  }
  // Let every bird see the whole flock so they can gather, chase and fight.
  for (const npc of npcs) npc.setFlock(npcs);
  return npcs;
}
