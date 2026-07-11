import * as THREE from 'three';
import { COLORS, RICE_MAX, RICE_SIZE, RICE_SPREAD } from '../config';

/** A source of food grains that pigeons can locate and eat. */
export interface FoodSource {
  /** Nearest uneaten grain to a point, or null if there is none. */
  nearest(x: number, z: number): { x: number; z: number; id: number } | null;
  /** Consume the grain with the given id (removes it from the scene). */
  eat(id: number): void;
}

interface Grain {
  mesh: THREE.Mesh;
  x: number;
  z: number;
}

/** Manages the rice grains scattered on the ground for the pigeons to eat. */
export class RiceSystem implements FoodSource {
  private readonly grains = new Map<number, Grain>();
  private nextId = 0;

  private readonly geometry: THREE.SphereGeometry;
  private readonly material: THREE.MeshStandardMaterial;

  constructor(private readonly scene: THREE.Scene) {
    this.geometry = new THREE.SphereGeometry(RICE_SIZE, 6, 5);
    this.material = new THREE.MeshStandardMaterial({ color: COLORS.rice, roughness: 0.85 });
  }

  /** Scatter `count` grains around a ground point. */
  scatter(centerX: number, centerZ: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * RICE_SPREAD;
      const x = centerX + Math.cos(a) * r;
      const z = centerZ + Math.sin(a) * r;

      const mesh = new THREE.Mesh(this.geometry, this.material);
      mesh.scale.set(1, 0.55, 1.7); // stretched into a rice-grain shape
      mesh.rotation.y = Math.random() * Math.PI;
      mesh.position.set(x, RICE_SIZE * 0.55, z);
      this.scene.add(mesh);

      const id = this.nextId++;
      this.grains.set(id, { mesh, x, z });
    }
    this.enforceCap();
  }

  nearest(x: number, z: number): { x: number; z: number; id: number } | null {
    let bestId = -1;
    let bestDist = Infinity;
    for (const [id, g] of this.grains) {
      const d = (g.x - x) ** 2 + (g.z - z) ** 2;
      if (d < bestDist) {
        bestDist = d;
        bestId = id;
      }
    }
    if (bestId < 0) return null;
    const g = this.grains.get(bestId)!;
    return { x: g.x, z: g.z, id: bestId };
  }

  eat(id: number): void {
    const g = this.grains.get(id);
    if (!g) return;
    this.scene.remove(g.mesh);
    this.grains.delete(id);
  }

  /** Drop the oldest grains once past the cap so the ground never overflows. */
  private enforceCap(): void {
    while (this.grains.size > RICE_MAX) {
      const oldest = this.grains.keys().next().value as number;
      this.eat(oldest);
    }
  }
}
