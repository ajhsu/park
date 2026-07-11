import * as THREE from 'three';
import { COLORS } from '../config';

/**
 * Build the park environment (ground, plaza, path, pond, and scattered
 * trees, bushes, benches and lampposts) and add it to the scene.
 */
export function buildPark(scene: THREE.Scene): THREE.Group {
  const park = new THREE.Group();
  scene.add(park);

  // Grass ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.MeshStandardMaterial({ color: COLORS.grass, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  park.add(ground);

  // Central sandy plaza
  const plaza = new THREE.Mesh(
    new THREE.CircleGeometry(4, 48),
    new THREE.MeshStandardMaterial({ color: COLORS.plaza, roughness: 1 }),
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.01;
  plaza.receiveShadow = true;
  park.add(plaza);

  // Pathway ring around the plaza
  const path = new THREE.Mesh(
    new THREE.RingGeometry(8, 9.4, 64),
    new THREE.MeshStandardMaterial({ color: COLORS.path, roughness: 1 }),
  );
  path.rotation.x = -Math.PI / 2;
  path.position.y = 0.01;
  path.receiveShadow = true;
  park.add(path);

  // Pond
  const pond = new THREE.Mesh(
    new THREE.CircleGeometry(3.2, 48),
    new THREE.MeshStandardMaterial({ color: COLORS.pond, roughness: 0.2, metalness: 0.2 }),
  );
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(-12, 0.02, -4);
  pond.receiveShadow = true;
  park.add(pond);

  const pondRim = new THREE.Mesh(
    new THREE.RingGeometry(3.2, 3.7, 48),
    new THREE.MeshStandardMaterial({ color: COLORS.pondRim, roughness: 1 }),
  );
  pondRim.rotation.x = -Math.PI / 2;
  pondRim.position.set(-12, 0.015, -4);
  park.add(pondRim);

  // --- Reusable materials ---
  const trunkMat = new THREE.MeshStandardMaterial({ color: COLORS.trunk, roughness: 0.9 });
  const leafMats = COLORS.leaves.map(
    (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.9 }),
  );

  function makeTree(x: number, z: number, scale = 1): void {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 1.6, 8), trunkMat);
    trunk.position.y = 0.8;
    trunk.castShadow = true;
    tree.add(trunk);

    const blobs = [
      { r: 1.1, y: 2.1, x: 0, z: 0 },
      { r: 0.85, y: 2.6, x: 0.6, z: 0.3 },
      { r: 0.8, y: 2.5, x: -0.6, z: -0.2 },
      { r: 0.75, y: 3.0, x: 0.1, z: -0.4 },
    ];
    blobs.forEach((b, i) => {
      const leaf = new THREE.Mesh(
        new THREE.IcosahedronGeometry(b.r, 1),
        leafMats[i % leafMats.length],
      );
      leaf.position.set(b.x, b.y, b.z);
      leaf.castShadow = true;
      tree.add(leaf);
    });

    tree.position.set(x, 0, z);
    tree.scale.setScalar(scale);
    park.add(tree);
  }

  function makeBush(x: number, z: number, scale = 1): void {
    const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), leafMats[1]);
    bush.position.set(x, 0.45 * scale, z);
    bush.scale.setScalar(scale);
    bush.castShadow = true;
    bush.receiveShadow = true;
    park.add(bush);
  }

  function makeBench(x: number, z: number, rotationY = 0): void {
    const bench = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: COLORS.benchWood, roughness: 0.8 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.5), woodMat);
    seat.position.y = 0.45;
    seat.castShadow = true;
    bench.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.1), woodMat);
    back.position.set(0, 0.72, -0.2);
    back.castShadow = true;
    bench.add(back);
    const legMat = new THREE.MeshStandardMaterial({
      color: COLORS.benchLeg,
      roughness: 0.6,
      metalness: 0.4,
    });
    const legSpots: [number, number][] = [
      [-0.7, 0.2],
      [0.7, 0.2],
      [-0.7, -0.2],
      [0.7, -0.2],
    ];
    legSpots.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.1), legMat);
      leg.position.set(lx, 0.22, lz);
      leg.castShadow = true;
      bench.add(leg);
    });
    bench.position.set(x, 0, z);
    bench.rotation.y = rotationY;
    park.add(bench);
  }

  function makeLamp(x: number, z: number): void {
    const lamp = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({
      color: COLORS.lampPole,
      roughness: 0.5,
      metalness: 0.6,
    });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3, 10), poleMat);
    pole.position.y = 1.5;
    pole.castShadow = true;
    lamp.add(pole);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      new THREE.MeshStandardMaterial({
        color: COLORS.lampHead,
        emissive: COLORS.lampEmissive,
        emissiveIntensity: 1.2,
        roughness: 0.4,
      }),
    );
    head.position.y = 3.05;
    lamp.add(head);
    lamp.position.set(x, 0, z);
    park.add(lamp);
  }

  // --- Populate the park ---
  // Trees ringed around the outside for movement reference.
  const treeSpots: [number, number][] = [
    [10, 0],
    [8, 8],
    [0, 11],
    [-9, 7],
    [-11, -2],
    [-7, -9],
    [2, -12],
    [11, -6],
    [14, 4],
    [-14, -10],
  ];
  treeSpots.forEach(([x, z], i) => makeTree(x, z, 0.9 + (i % 3) * 0.25));

  // Bushes near the plaza edge.
  const bushSpots: [number, number][] = [
    [5, 1],
    [4.5, -3],
    [-4.5, 2.5],
    [-3.5, -4],
    [1, 5],
    [-1, -5],
    [6, 4],
    [-6, -1],
  ];
  bushSpots.forEach(([x, z], i) => makeBush(x, z, 0.9 + (i % 2) * 0.4));

  // Benches facing the plaza.
  makeBench(0, 4.6, Math.PI);
  makeBench(0, -4.6, 0);
  makeBench(4.6, 0, -Math.PI / 2);
  makeBench(-4.6, 0, Math.PI / 2);

  // Lampposts on the path corners.
  makeLamp(6.2, 6.2);
  makeLamp(-6.2, 6.2);
  makeLamp(6.2, -6.2);
  makeLamp(-6.2, -6.2);

  return park;
}
