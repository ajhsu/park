import * as THREE from 'three';
import './style.css';

import { createRenderer } from './core/renderer';
import { createScene } from './core/scene';
import { createCamera, createControls } from './core/camera';
import { addLights } from './core/lights';
import { buildPark } from './world/park';
import { createKeyboard } from './input/keyboard';
import { loadPigeonModel } from './entities/pigeonModel';
import { Player } from './entities/player';
import { spawnNpcs, type Npc } from './entities/npc';

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

const keys = createKeyboard();

// --- Entities (created once the model has loaded) ---
let player: Player | null = null;
let npcs: Npc[] = [];

loadPigeonModel()
  .then((model) => {
    player = new Player(scene, camera, controls, keys, model);
    npcs = spawnNpcs(scene, model);

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

  player?.update(delta);
  for (const npc of npcs) npc.update(delta);

  controls.update();
  renderer.render(scene, camera);
}

animate();
