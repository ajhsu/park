import * as THREE from 'three';
import { PERSON_COLLISION_RADIUS, RICE_PER_FEED } from '../config';
import { createAudio, type GameAudio } from '../core/audio';
import { createCamera, createControls } from '../core/camera';
import { addLights } from '../core/lights';
import { createRenderer } from '../core/renderer';
import { createScene } from '../core/scene';
import { loadCooBuffer } from '../audio/coo';
import { Person } from '../entities/person';
import { Player } from '../entities/player';
import { loadPigeonModel } from '../entities/pigeonModel';
import { spawnNpcs } from '../entities/npc/flock';
import type { Npc, NpcAudio } from '../entities/npc/Npc';
import { createMovementInput, type MovementInput } from '../input/movement';
import { CollisionWorld } from '../world/collision';
import { buildPark } from '../world/park';
import { RiceSystem } from '../world/rice';
import { createHud, type Hud } from '../ui/hud';
import { GameModes } from './GameModes';

/**
 * Top-level orchestrator: owns the renderer, scene, camera and shared systems
 * (collision, audio, input, HUD), loads the entities, wires the HUD callbacks
 * to gameplay and runs the render loop.
 */
export class Game {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: ReturnType<typeof createControls>;
  private readonly collision = new CollisionWorld();
  private readonly audio: GameAudio;
  private readonly movementInput: MovementInput = createMovementInput();
  private readonly clock = new THREE.Clock();
  private readonly hud: Hud;
  private readonly modes: GameModes;

  private player: Player | null = null;
  private npcs: Npc[] = [];
  private person: Person | null = null;
  private rice: RiceSystem | null = null;

  constructor(app: HTMLElement) {
    this.renderer = createRenderer(app);
    this.scene = createScene();
    this.camera = createCamera(window.innerWidth / window.innerHeight);
    this.controls = createControls(this.camera, this.renderer.domElement);

    addLights(this.scene);
    buildPark(this.scene, this.collision);

    this.audio = createAudio(this.camera);
    this.hud = createHud({
      onMute: (muted) => this.audio.setMuted(muted),
      onModeToggle: () => this.modes.toggle(),
      onFeed: () => this.feed(),
      onCoo: () => this.playerCoo(),
      onFight: () => this.playerFight(),
    });
    this.modes = new GameModes(this.camera, this.controls, this.hud);

    window.addEventListener('resize', () => this.onResize());
  }

  /** Kick off entity loading and start the render loop. */
  start(): void {
    this.loadPigeon();
    this.loadPerson();
    this.animate();
  }

  private loadPigeon(): void {
    loadPigeonModel()
      .then(async (model) => {
        this.player = new Player(
          this.scene,
          this.camera,
          this.controls,
          this.movementInput,
          model,
          this.collision,
        );

        // Load the coo audio; if it fails, the pigeons simply stay silent.
        const cooBuffer = await loadCooBuffer().catch((err) => {
          console.error('Failed to load coo audio:', err);
          return null;
        });
        const npcAudio: NpcAudio | undefined = cooBuffer
          ? { listener: this.audio.listener, cooBuffer }
          : undefined;
        if (cooBuffer) this.player.enableCoo(this.audio.listener, cooBuffer);

        this.rice = new RiceSystem(this.scene);
        this.npcs = spawnNpcs(
          this.scene,
          model,
          this.collision,
          npcAudio,
          this.rice,
          () => (this.person ? this.person.feedPoint : null),
          // The player pigeon is charming: NPCs are drawn to gather round it,
          // but only while it's the active pigeon on screen.
          () => (this.player && this.modes.isPigeon ? this.player.pivot.position : null),
        );

        this.modes.player = this.player;
        this.modes.apply();
        this.hud.hideLoader();
      })
      .catch((err) => {
        console.error(err);
        this.hud.showError(
          'Could not load the 3D pigeon model. Check your internet connection and try again.',
        );
      });
  }

  private loadPerson(): void {
    // Load the seated person in parallel; if it fails, person mode is empty.
    Person.load(this.scene)
      .then((p) => {
        this.person = p;
        // Pigeons gather around the seated person but shouldn't stand inside them.
        this.collision.addObstacle(p.group.position.x, p.group.position.z, PERSON_COLLISION_RADIUS);
        this.modes.person = p;
        this.modes.apply();
      })
      .catch((err) => console.error('Failed to load person model:', err));
  }

  private feed(): void {
    if (this.rice && this.person) {
      this.rice.scatter(this.person.feedPoint.x, this.person.feedPoint.z, RICE_PER_FEED);
    }
  }

  private playerCoo(): void {
    if (!this.modes.isPigeon || !this.player) return;
    this.player.coo();
    for (const npc of this.npcs) npc.reactToPlayerCoo(this.player.pivot.position);
  }

  private playerFight(): void {
    if (!this.modes.isPigeon || !this.player) return;
    this.player.fight();
    for (const npc of this.npcs) npc.reactToPlayerFight(this.player.pivot.position);
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private readonly animate = (): void => {
    requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();

    if (this.modes.isPigeon) this.player?.update(delta);
    this.person?.update(delta);
    for (const npc of this.npcs) npc.update(delta);

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}
