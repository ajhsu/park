import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Person } from '../entities/person';
import type { Player } from '../entities/player';
import type { Hud } from '../ui/hud';

/** The two playable perspectives. */
export type Mode = 'person' | 'pigeon';

/**
 * Tracks the active mode (control the pigeon vs. sit as the person) and applies
 * its consequences: which entity is visible, how the camera is framed and what
 * the HUD shows. The player and person are attached once they finish loading.
 */
export class GameModes {
  private mode: Mode = 'pigeon';
  player: Player | null = null;
  person: Person | null = null;

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly controls: OrbitControls,
    private readonly hud: Hud,
  ) {}

  /** True while the player is controlling the pigeon. */
  get isPigeon(): boolean {
    return this.mode === 'pigeon';
  }

  /** Flip between pigeon and person mode and apply the change. */
  toggle(): void {
    this.mode = this.mode === 'person' ? 'pigeon' : 'person';
    this.apply();
  }

  /** Sync entity visibility, camera framing and the HUD to the current mode. */
  apply(): void {
    const isPerson = this.mode === 'person';
    if (this.player) this.player.pivot.visible = !isPerson;
    this.person?.setVisible(isPerson);
    this.hud.setMode(isPerson);
    if (isPerson) this.focusPerson();
    else this.focusPigeon();
  }

  private focusPerson(): void {
    if (!this.person) return;
    const p = this.person.group.position;
    // Look toward the seated person from the front, framing the feeding area.
    this.controls.target.set(p.x, 0.7, p.z + 1.4);
    this.camera.position.set(p.x + 3.4, 2.4, p.z + 5.6);
    this.controls.update();
  }

  private focusPigeon(): void {
    if (!this.player) return;
    const p = this.player.pivot.position;
    this.controls.target.set(p.x, 0.5, p.z);
    this.camera.position.set(p.x + 3, 2.2, p.z + 5);
    this.controls.update();
  }
}
