import * as THREE from 'three';
import './style.css';

import { createRenderer } from './core/renderer';
import { createScene } from './core/scene';
import { createCamera, createControls } from './core/camera';
import { addLights } from './core/lights';
import { buildPark } from './world/park';
import { createMovementInput } from './input/movement';
import { loadPigeonModel } from './entities/pigeonModel';
import { Player } from './entities/player';
import { spawnNpcs, type Npc, type NpcAudio } from './entities/npc';
import { loadCooBuffer } from './audio/coo';
import { Person } from './entities/person';
import { RiceSystem } from './world/rice';
import { addObstacle } from './world/collision';
import { PERSON_COLLISION_RADIUS, RICE_PER_FEED } from './config';

const app = document.getElementById('app')!;
const loaderEl = document.getElementById('loader');
const errorEl = document.getElementById('error');

// --- Core setup ---
const renderer = createRenderer(app);
const scene = createScene();
const camera = createCamera(window.innerWidth / window.innerHeight);
const controls = createControls(camera, renderer.domElement);

addLights(scene);
buildPark(scene);

const movementInput = createMovementInput();

// --- Audio (3D positional cooing) ---
const listener = new THREE.AudioListener();
camera.add(listener);

// Browsers block audio until a user gesture; resume the context on first input.
const resumeAudio = (): void => {
  void listener.context.resume();
  window.removeEventListener('pointerdown', resumeAudio);
  window.removeEventListener('keydown', resumeAudio);
};
window.addEventListener('pointerdown', resumeAudio);
window.addEventListener('keydown', resumeAudio);

// --- Mute toggle (sound defaults to on) ---
const muteBtn = document.getElementById('mute-btn') as HTMLButtonElement | null;
let muted = false;
if (muteBtn) {
  muteBtn.addEventListener('click', () => {
    muted = !muted;
    listener.setMasterVolume(muted ? 0 : 1);
    muteBtn.textContent = muted ? '🔇' : '🔊';
    muteBtn.classList.toggle('muted', muted);
    muteBtn.setAttribute('aria-pressed', String(muted));
    const label = muted ? 'Unmute sound' : 'Mute sound';
    muteBtn.setAttribute('aria-label', label);
    muteBtn.title = label;
  });
}

// --- Credits toggle (attribution hidden until requested) ---
const creditsBtn = document.getElementById('credits-btn');
const creditsEl = document.getElementById('credits');
creditsBtn?.addEventListener('click', () => {
  const show = creditsEl?.hasAttribute('hidden') ?? false;
  if (show) creditsEl?.removeAttribute('hidden');
  else creditsEl?.setAttribute('hidden', '');
  creditsBtn.setAttribute('aria-expanded', String(show));
  creditsBtn.title = show ? 'Hide credits' : 'Show credits';
});

// --- Entities (created once the model has loaded) ---
let player: Player | null = null;
let npcs: Npc[] = [];
let person: Person | null = null;
let rice: RiceSystem | null = null;

// --- Game modes: 'pigeon' (default) and 'person' ---
type Mode = 'person' | 'pigeon';
let mode: Mode = 'pigeon';
document.body.classList.add('mode-pigeon');

const modeToggle = document.getElementById('mode-toggle') as HTMLButtonElement | null;
const feedBtn = document.getElementById('feed-btn') as HTMLButtonElement | null;
const hintEl = document.getElementById('hint');

function focusCameraOnPerson(): void {
  if (!person) return;
  const p = person.group.position;
  // Look toward the seated person from the front, framing the feeding area.
  controls.target.set(p.x, 0.7, p.z + 1.4);
  camera.position.set(p.x + 3.4, 2.4, p.z + 5.6);
  controls.update();
}

function focusCameraOnPigeon(): void {
  if (!player) return;
  const p = player.pivot.position;
  controls.target.set(p.x, 0.5, p.z);
  camera.position.set(p.x + 3, 2.2, p.z + 5);
  controls.update();
}

function applyMode(): void {
  const isPerson = mode === 'person';
  document.body.classList.toggle('mode-person', isPerson);
  document.body.classList.toggle('mode-pigeon', !isPerson);

  if (player) player.pivot.visible = !isPerson;
  person?.setVisible(isPerson);

  if (modeToggle) {
    modeToggle.textContent = isPerson ? '\uD83D\uDD4A\uFE0F Switch to Pigeon' : '\uD83E\uDDCD Switch to Person';
  }
  if (hintEl) {
    hintEl.innerHTML = isPerson
      ? 'Tap <b>Feed</b> to scatter rice — the flock will come and eat · drag to look around'
      : '<b>WASD</b> or the on-screen joystick to walk · drag to orbit · pinch/scroll to zoom';
  }

  if (isPerson) focusCameraOnPerson();
  else focusCameraOnPigeon();
}

modeToggle?.addEventListener('click', () => {
  mode = mode === 'person' ? 'pigeon' : 'person';
  applyMode();
});

feedBtn?.addEventListener('click', () => {
  if (rice && person) rice.scatter(person.feedPoint.x, person.feedPoint.z, RICE_PER_FEED);
});

loadPigeonModel()
  .then(async (model) => {
    player = new Player(scene, camera, controls, movementInput, model);

    // Load the coo audio; if it fails, the pigeons simply stay silent.
    const cooBuffer = await loadCooBuffer().catch((err) => {
      console.error('Failed to load coo audio:', err);
      return null;
    });
    const npcAudio: NpcAudio | undefined = cooBuffer ? { listener, cooBuffer } : undefined;
    rice = new RiceSystem(scene);
    npcs = spawnNpcs(
      scene,
      model,
      npcAudio,
      rice,
      () => (person ? person.feedPoint : null),
      // The player pigeon is charming: NPCs are drawn to gather round it, but
      // only while it's the active pigeon on screen.
      () => (player && mode === 'pigeon' ? player.pivot.position : null),
    );

    player.pivot.visible = mode === 'pigeon';
    applyMode();

    loaderEl?.classList.add('hidden');
    setTimeout(() => loaderEl?.remove(), 700);
  })
  .catch((err) => {
    console.error(err);
    loaderEl?.remove();
    if (errorEl) {
      errorEl.style.display = 'flex';
      errorEl.textContent =
        'Could not load the 3D pigeon model. Check your internet connection and try again.';
    }
  });

// Load the seated person in parallel; if it fails, person mode is simply empty.
Person.load(scene)
  .then((p) => {
    person = p;
    // Pigeons gather around the seated person but shouldn't stand inside them.
    addObstacle(p.group.position.x, p.group.position.z, PERSON_COLLISION_RADIUS);
    applyMode();
  })
  .catch((err) => console.error('Failed to load person model:', err));

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Render loop ---
const clock = new THREE.Clock();

function animate(): void {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (mode === 'pigeon') player?.update(delta);
  person?.update(delta);
  for (const npc of npcs) npc.update(delta);

  controls.update();
  renderer.render(scene, camera);
}

animate();
