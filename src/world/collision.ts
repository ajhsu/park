import * as THREE from 'three';

/**
 * Very small, ground-plane collision system. Everything is approximated as a
 * circle in the x/z plane:
 *
 * - Static obstacles (benches, trees, bushes, lamps, rocks, the fountain, the
 *   pond and the seated person) are registered once and never move.
 * - Dynamic agents (the player pigeon and every NPC pigeon) push out of the
 *   static obstacles and gently separate from one another so nothing overlaps
 *   or walks through anything.
 *
 * A single {@link CollisionWorld} instance is created by the game and shared
 * with the park builder and every pigeon; there is no global state.
 */

/** A static circular obstacle on the ground (x/z centre + radius). */
interface Obstacle {
  x: number;
  z: number;
  radius: number;
}

/** A moving pigeon that participates in mutual (agent-vs-agent) separation. */
export interface CollisionAgent {
  /** Live reference to the pigeon's position (mutated in place). */
  readonly position: THREE.Vector3;
  readonly radius: number;
}

export class CollisionWorld {
  private readonly obstacles: Obstacle[] = [];
  private readonly agents: CollisionAgent[] = [];

  /** Register a static obstacle (bench, tree, rock, fountain, person, …). */
  addObstacle(x: number, z: number, radius: number): void {
    this.obstacles.push({ x, z, radius });
  }

  /** Register a moving pigeon so it both pushes and is pushed by other pigeons. */
  addAgent(agent: CollisionAgent): void {
    this.agents.push(agent);
  }

  /**
   * Push a circle (centre mutated in place) out of every static obstacle it
   * overlaps, so pigeons and the person can't walk through benches, trees, etc.
   */
  resolveStatic(position: THREE.Vector3, radius: number): void {
    for (const o of this.obstacles) {
      const dx = position.x - o.x;
      const dz = position.z - o.z;
      const min = o.radius + radius;
      const distSq = dx * dx + dz * dz;
      if (distSq >= min * min) continue;

      const dist = Math.sqrt(distSq);
      if (dist > 1e-5) {
        const push = (min - dist) / dist;
        position.x += dx * push;
        position.z += dz * push;
      } else {
        // Exactly on the obstacle centre: nudge out in an arbitrary direction.
        position.x += min;
      }
    }
  }

  /**
   * Separate a pigeon from all other registered pigeons. Each bird moves half of
   * every overlap, so a pair meeting head-on ends up cleanly apart once both
   * have run their update.
   */
  resolveAgents(self: CollisionAgent): void {
    for (const other of this.agents) {
      if (other === self) continue;
      const dx = self.position.x - other.position.x;
      const dz = self.position.z - other.position.z;
      const min = self.radius + other.radius;
      const distSq = dx * dx + dz * dz;
      if (distSq >= min * min || distSq <= 1e-8) continue;

      const dist = Math.sqrt(distSq);
      const push = ((min - dist) / dist) * 0.5;
      self.position.x += dx * push;
      self.position.z += dz * push;
    }
  }
}
