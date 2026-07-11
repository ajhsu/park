/** Live analog joystick state: x = strafe (-1 left … 1 right), y = forward (-1 back … 1 forward). */
export interface Joystick {
  x: number;
  y: number;
}

/**
 * Create an on-screen virtual thumbstick (for touch devices) and return a live
 * state object that is updated as the user drags it. The element is styled to
 * only be visible on coarse-pointer (touch) devices via CSS.
 */
export function createJoystick(): Joystick {
  const state: Joystick = { x: 0, y: 0 };

  const base = document.createElement('div');
  base.id = 'joystick';
  const knob = document.createElement('div');
  knob.id = 'joystick-knob';
  base.appendChild(knob);
  document.body.appendChild(base);

  const radius = 44; // max knob travel in px
  let pointerId: number | null = null;

  const setKnob = (dx: number, dy: number): void => {
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const move = (e: PointerEvent): void => {
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > radius) {
      dx = (dx / dist) * radius;
      dy = (dy / dist) * radius;
    }
    setKnob(dx, dy);
    state.x = dx / radius;
    state.y = -dy / radius; // up on screen = forward
  };

  const end = (e: PointerEvent): void => {
    if (e.pointerId !== pointerId) return;
    pointerId = null;
    state.x = 0;
    state.y = 0;
    setKnob(0, 0);
  };

  base.addEventListener('pointerdown', (e) => {
    pointerId = e.pointerId;
    try {
      base.setPointerCapture(e.pointerId);
    } catch {
      /* ignore capture failures (e.g. synthetic events) */
    }
    move(e);
    e.preventDefault();
  });
  base.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pointerId) return;
    move(e);
    e.preventDefault();
  });
  base.addEventListener('pointerup', end);
  base.addEventListener('pointercancel', end);

  return state;
}
