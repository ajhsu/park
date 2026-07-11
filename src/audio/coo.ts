import * as THREE from 'three';
import cooUrl from './rock-pigeon-coo.mp3';

/**
 * Load the rock pigeon coo recording and decode it into an AudioBuffer that
 * can be shared by every NPC's positional audio source.
 *
 * Source: "Columba livia – Rock Dove" by Marie-Lan Taÿ Pamart (CC BY-SA 4.0),
 * trimmed to a single coo phrase.
 */
export function loadCooBuffer(): Promise<AudioBuffer> {
  const loader = new THREE.AudioLoader();
  return new Promise((resolve, reject) => {
    loader.load(cooUrl, resolve, undefined, reject);
  });
}
