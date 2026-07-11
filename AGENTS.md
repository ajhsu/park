# Agent Instructions

## Art & media assets — do not fabricate

When asked to add any artistic resource — a sound effect, music track, 3D model,
texture, sprite, image, font, or similar — **do not make it up or generate it yourself.**
Today's LLMs are still poor at authoring quality art assets, and fabricated or
procedurally faked assets tend to look/sound wrong and waste time.

Instead:

- **Search online for free, license-appropriate resources** and use a real asset.
  Good sources include:
  - 3D models: [Poly Pizza](https://poly.pizza), [Sketchfab (downloadable/CC)](https://sketchfab.com), [Quaternius](https://quaternius.com), [Kenney](https://kenney.nl)
  - Audio / SFX / music: [Freesound](https://freesound.org), [Kenney](https://kenney.nl), [OpenGameArt](https://opengameart.org), [Pixabay](https://pixabay.com)
  - Textures / images: [Poly Haven](https://polyhaven.com), [Kenney](https://kenney.nl), [OpenGameArt](https://opengameart.org)
- **Verify the license** (prefer CC0 / public domain, or clearly permissive) and
  **record attribution** when the license requires it.
- **Tell me the source and license** of any asset you add so I can review it.
- If you cannot find a suitable free resource, **stop and ask me** rather than
  inventing a placeholder that pretends to be the real thing. A clearly-labeled
  temporary placeholder is acceptable only if you flag it explicitly.

## Temporary files

Write all throwaway/temporary files — Playwright screenshots, scratch scripts,
downloaded assets you're inspecting, debug dumps, etc. — into a **`.tmp/`**
directory at the repo root, never directly in the project root or source
folders. Create `.tmp/` if it doesn't exist. It is gitignored.
