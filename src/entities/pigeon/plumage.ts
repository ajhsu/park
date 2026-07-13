import * as THREE from 'three';
import { rand } from '../../utils/math';

/**
 * Distinct plumage "morphs" — each is a foundation colour drawn from real
 * pigeon colour families (blue-bar slate, red-bar rust, ash-red cream,
 * chocolate checker, dark spread, pale pied). They look clearly different
 * from one another; within-group jitter is added separately.
 */
const PIGEON_MORPHS: number[] = [
  0x9aa4b0, // blue-bar slate (cool blue-grey)
  0xc0673a, // red-bar (rich rust / orange-brown)
  0xe7d2bd, // ash-red (warm cream)
  0x8a6446, // chocolate checker (brown)
  0x585a63, // spread (dark slate, near-black)
  0xf1efe9, // pied / pale (near-white)
];

/**
 * Pick a foundation morph, then nudge it by a small random amount so birds in
 * the same morph share a family colour but each is subtly unique.
 */
function pickPigeonTint(): THREE.Color {
  const base = PIGEON_MORPHS[Math.floor(Math.random() * PIGEON_MORPHS.length)];
  const tint = new THREE.Color(base);
  // Subtle within-group variation: tiny hue/saturation/lightness jitter.
  const hsl = { h: 0, s: 0, l: 0 };
  tint.getHSL(hsl);
  hsl.h = (hsl.h + rand(-0.02, 0.02) + 1) % 1;
  hsl.s = THREE.MathUtils.clamp(hsl.s + rand(-0.06, 0.06), 0, 1);
  hsl.l = THREE.MathUtils.clamp(hsl.l + rand(-0.07, 0.07), 0, 1);
  tint.setHSL(hsl.h, hsl.s, hsl.l);
  return tint;
}

/** Pick a plumage tint and apply it to every material on a cloned pigeon. */
export function applyPigeonTint(model: THREE.Object3D): void {
  const tint = pickPigeonTint();
  model.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    const clone = (mat: THREE.Material): THREE.Material => {
      const cloned = (mat as THREE.MeshStandardMaterial).clone();
      if ((cloned as THREE.MeshStandardMaterial).color) {
        (cloned as THREE.MeshStandardMaterial).color.multiply(tint);
      }
      return cloned;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(clone) : clone(mesh.material);
  });
}
