import { createKeyboard } from './keyboard';
import { createJoystick } from './joystick';

export interface Movement {
  /** forward: +1 forward / -1 back. strafe: +1 right / -1 left. Magnitude ≤ 1. */
  forward: number;
  strafe: number;
}

export interface MovementInput {
  read(): Movement;
}

/**
 * Combine keyboard (WASD / arrows) and the on-screen touch joystick into a
 * single analog movement vector, clamped to unit length.
 */
export function createMovementInput(): MovementInput {
  const keys = createKeyboard();
  const joystick = createJoystick();

  return {
    read(): Movement {
      let forward = (keys.w ? 1 : 0) - (keys.s ? 1 : 0) + joystick.y;
      let strafe = (keys.d ? 1 : 0) - (keys.a ? 1 : 0) + joystick.x;

      const mag = Math.hypot(forward, strafe);
      if (mag > 1) {
        forward /= mag;
        strafe /= mag;
      }
      return { forward, strafe };
    },
  };
}
