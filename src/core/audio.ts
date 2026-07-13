import * as THREE from 'three';

/** The game's 3D audio: a listener on the camera plus a master mute control. */
export interface GameAudio {
  readonly listener: THREE.AudioListener;
  /** Silence (or restore) all positional audio. */
  setMuted(muted: boolean): void;
}

/**
 * Attach an {@link THREE.AudioListener} to the camera and, because browsers
 * block audio until a user gesture, resume the audio context on first input.
 */
export function createAudio(camera: THREE.PerspectiveCamera): GameAudio {
  const listener = new THREE.AudioListener();
  camera.add(listener);

  const resume = (): void => {
    void listener.context.resume();
    window.removeEventListener('pointerdown', resume);
    window.removeEventListener('keydown', resume);
  };
  window.addEventListener('pointerdown', resume);
  window.addEventListener('keydown', resume);

  return {
    listener,
    setMuted: (muted) => listener.setMasterVolume(muted ? 0 : 1),
  };
}
