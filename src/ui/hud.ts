/**
 * All DOM/HUD wiring lives here: the mute, credits, mode, feed, coo and fight
 * controls, plus the hint text, loader and error overlay. The HUD owns the
 * page chrome and calls back into the game for gameplay actions.
 */

/** Gameplay callbacks the HUD invokes in response to user input. */
export interface HudCallbacks {
  /** Sound was toggled; `muted` is the new state. */
  onMute: (muted: boolean) => void;
  /** The player asked to switch between pigeon and person mode. */
  onModeToggle: () => void;
  /** Scatter rice (person mode). */
  onFeed: () => void;
  /** The player pigeon coos (pigeon mode). */
  onCoo: () => void;
  /** The player pigeon puts on a fight display (pigeon mode). */
  onFight: () => void;
}

/** Handles the game uses to update the HUD as its state changes. */
export interface Hud {
  /** Reflect the active mode in the body class, mode button and hint text. */
  setMode(isPerson: boolean): void;
  /** Fade out and remove the loading overlay. */
  hideLoader(): void;
  /** Replace the loader with a blocking error message. */
  showError(message: string): void;
}

const PIGEON_HINT =
  '<b>WASD</b> or the on-screen joystick to walk · <b>C</b> to coo, <b>F</b> to fight · drag to orbit · pinch/scroll to zoom';
const PERSON_HINT =
  'Tap <b>Feed</b> to scatter rice — the flock will come and eat · drag to look around';

/** Wire up all HUD controls and return handles for the game to drive it. */
export function createHud(callbacks: HudCallbacks): Hud {
  const loaderEl = document.getElementById('loader');
  const errorEl = document.getElementById('error');
  const hintEl = document.getElementById('hint');

  document.body.classList.add('mode-pigeon');

  // --- Mute toggle (sound defaults to on) ---
  const muteBtn = document.getElementById('mute-btn') as HTMLButtonElement | null;
  let muted = false;
  muteBtn?.addEventListener('click', () => {
    muted = !muted;
    callbacks.onMute(muted);
    muteBtn.textContent = muted ? 'Muted' : 'Sound';
    muteBtn.classList.toggle('muted', muted);
    muteBtn.setAttribute('aria-pressed', String(muted));
    const label = muted ? 'Unmute sound' : 'Mute sound';
    muteBtn.setAttribute('aria-label', label);
    muteBtn.title = label;
  });

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

  // --- Mode toggle & feed ---
  const modeToggle = document.getElementById('mode-toggle') as HTMLButtonElement | null;
  modeToggle?.addEventListener('click', () => callbacks.onModeToggle());

  const feedBtn = document.getElementById('feed-btn') as HTMLButtonElement | null;
  feedBtn?.addEventListener('click', () => callbacks.onFeed());

  // --- Pigeon actions: coo and fight (buttons + keyboard shortcuts) ---
  const cooBtn = document.getElementById('coo-btn') as HTMLButtonElement | null;
  const fightBtn = document.getElementById('fight-btn') as HTMLButtonElement | null;
  cooBtn?.addEventListener('click', () => callbacks.onCoo());
  fightBtn?.addEventListener('click', () => callbacks.onFight());
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.code === 'KeyC') callbacks.onCoo();
    else if (e.code === 'KeyF') callbacks.onFight();
  });

  return {
    setMode(isPerson) {
      document.body.classList.toggle('mode-person', isPerson);
      document.body.classList.toggle('mode-pigeon', !isPerson);
      if (modeToggle) {
        modeToggle.textContent = isPerson ? 'Switch to Pigeon' : 'Switch to Person';
      }
      if (hintEl) hintEl.innerHTML = isPerson ? PERSON_HINT : PIGEON_HINT;
    },
    hideLoader() {
      loaderEl?.classList.add('hidden');
      setTimeout(() => loaderEl?.remove(), 700);
    },
    showError(message) {
      loaderEl?.remove();
      if (errorEl) {
        errorEl.style.display = 'flex';
        errorEl.textContent = message;
      }
    },
  };
}
