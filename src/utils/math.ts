/** Small shared math helpers used across entities and the world. */

/** A ground point on the x/z plane. */
export interface Point2 {
  x: number;
  z: number;
}

/** Random float in the half-open range [a, b). */
export const rand = (a: number, b: number): number => a + Math.random() * (b - a);

/**
 * Shortest signed angular difference (radians) to rotate from `current` toward
 * `target`, wrapped to (-PI, PI] so turns always take the short way round.
 */
export function shortestAngle(target: number, current: number): number {
  const diff = target - current;
  return Math.atan2(Math.sin(diff), Math.cos(diff));
}

/** A random point in a ring around (cx, cz) with radius in [minR, maxR). */
export function ringPoint(cx: number, cz: number, minR: number, maxR: number): Point2 {
  const a = Math.random() * Math.PI * 2;
  const r = rand(minR, maxR);
  return { x: cx + Math.cos(a) * r, z: cz + Math.sin(a) * r };
}

/** A random point in a ring centred on the origin with radius in [minR, maxR). */
export function randomPointOnDisc(minR: number, maxR: number): Point2 {
  return ringPoint(0, 0, minR, maxR);
}
