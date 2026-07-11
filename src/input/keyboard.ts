/** Tracks WASD / arrow-key state for driving the player pigeon. */
export interface KeyState {
  w: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
}

const keyMap: Record<string, keyof KeyState> = {
  KeyW: 'w',
  KeyA: 'a',
  KeyS: 's',
  KeyD: 'd',
  ArrowUp: 'w',
  ArrowLeft: 'a',
  ArrowDown: 's',
  ArrowRight: 'd',
};

/**
 * Register keyboard listeners and return a live key-state object that is
 * mutated as keys are pressed and released.
 */
export function createKeyboard(): KeyState {
  const keys: KeyState = { w: false, a: false, s: false, d: false };

  window.addEventListener('keydown', (e) => {
    const k = keyMap[e.code];
    if (k) {
      keys[k] = true;
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => {
    const k = keyMap[e.code];
    if (k) {
      keys[k] = false;
      e.preventDefault();
    }
  });
  window.addEventListener('blur', () => {
    keys.w = keys.a = keys.s = keys.d = false;
  });

  return keys;
}
