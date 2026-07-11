import * as THREE from 'three';
import { COLORS, GROUND_RADIUS } from '../config';
import { addObstacle } from './collision';

/**
 * Build the park environment (ground, plaza, path spokes, pond, fountain,
 * and scattered trees, bushes, flowers, rocks, benches, lampposts, a picnic
 * blanket and a boundary fence) and add it to the scene.
 */
export function buildPark(scene: THREE.Scene): THREE.Group {
  const park = new THREE.Group();
  scene.add(park);

  // Grass ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(160, 160),
    new THREE.MeshStandardMaterial({ color: COLORS.grass, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  park.add(ground);

  // Central sandy plaza (kept open as the feeding area)
  const plaza = new THREE.Mesh(
    new THREE.CircleGeometry(5, 48),
    new THREE.MeshStandardMaterial({ color: COLORS.plaza, roughness: 1 }),
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.01;
  plaza.receiveShadow = true;
  park.add(plaza);

  // Pathway ring around the plaza
  const path = new THREE.Mesh(
    new THREE.RingGeometry(9, 10.6, 64),
    new THREE.MeshStandardMaterial({ color: COLORS.path, roughness: 1 }),
  );
  path.rotation.x = -Math.PI / 2;
  path.position.y = 0.01;
  path.receiveShadow = true;
  park.add(path);

  // Radial garden paths reaching out toward the tree line
  const spokeMat = new THREE.MeshStandardMaterial({ color: COLORS.path, roughness: 1 });
  for (let i = 0; i < 4; i++) {
    const spoke = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 10), spokeMat);
    spoke.rotation.x = -Math.PI / 2;
    spoke.rotation.z = (i * Math.PI) / 2 + Math.PI / 4;
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    spoke.position.set(Math.cos(a) * 14.8, 0.008, Math.sin(a) * 14.8);
    spoke.receiveShadow = true;
    park.add(spoke);
  }

  // Pond (off to one side) with a stone rim
  const pondCenter = { x: -18, z: -7 };
  const pond = new THREE.Mesh(
    new THREE.CircleGeometry(4.6, 56),
    new THREE.MeshStandardMaterial({ color: COLORS.pond, roughness: 0.2, metalness: 0.2 }),
  );
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(pondCenter.x, 0.02, pondCenter.z);
  pond.receiveShadow = true;
  park.add(pond);

  const pondRim = new THREE.Mesh(
    new THREE.RingGeometry(4.6, 5.3, 56),
    new THREE.MeshStandardMaterial({ color: COLORS.pondRim, roughness: 1 }),
  );
  pondRim.rotation.x = -Math.PI / 2;
  pondRim.position.set(pondCenter.x, 0.015, pondCenter.z);
  park.add(pondRim);

  // Keep pigeons off the water.
  addObstacle(pondCenter.x, pondCenter.z, 4.8);

  // --- Reusable materials ---
  const trunkMat = new THREE.MeshStandardMaterial({ color: COLORS.trunk, roughness: 0.9 });
  const leafMats = COLORS.leaves.map(
    (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.9 }),
  );
  const rockMat = new THREE.MeshStandardMaterial({ color: COLORS.rock, roughness: 0.95 });
  const stemMat = new THREE.MeshStandardMaterial({ color: COLORS.leaves[2], roughness: 0.9 });
  const flowerMats = COLORS.flowers.map(
    (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.7 }),
  );
  const flowerCenterMat = new THREE.MeshStandardMaterial({
    color: COLORS.flowerCenter,
    roughness: 0.6,
  });

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
    addObstacle(x, z, 0.45 * scale);
  }

  function makeBush(x: number, z: number, scale = 1): void {
    const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), leafMats[1]);
    bush.position.set(x, 0.45 * scale, z);
    bush.scale.setScalar(scale);
    bush.castShadow = true;
    bush.receiveShadow = true;
    park.add(bush);
    addObstacle(x, z, 0.5 * scale);
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

    // Approximate the long seat with a few circles spaced along its length.
    const cos = Math.cos(rotationY);
    const sin = Math.sin(rotationY);
    for (const lx of [-0.5, 0, 0.5]) {
      addObstacle(x + lx * cos, z - lx * sin, 0.38);
    }
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
    addObstacle(x, z, 0.25);
  }

  function makeRock(x: number, z: number, scale = 1): void {
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 0), rockMat);
    rock.position.set(x, 0.18 * scale, z);
    rock.scale.set(scale, scale * 0.7, scale);
    rock.rotation.set(Math.random(), Math.random() * Math.PI * 2, Math.random());
    rock.castShadow = true;
    rock.receiveShadow = true;
    park.add(rock);
    addObstacle(x, z, 0.4 * scale);
  }

  function makeFlower(x: number, z: number): void {
    const flower = new THREE.Group();
    const h = 0.35 + Math.random() * 0.25;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, h, 5), stemMat);
    stem.position.y = h / 2;
    flower.add(stem);

    const petalMat = flowerMats[(Math.random() * flowerMats.length) | 0];
    const petals = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 0), petalMat);
    petals.position.y = h;
    petals.scale.y = 0.6;
    flower.add(petals);

    const center = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), flowerCenterMat);
    center.position.y = h + 0.02;
    flower.add(center);

    flower.position.set(x, 0, z);
    flower.rotation.y = Math.random() * Math.PI * 2;
    park.add(flower);
  }

  /** A small cluster of flowers around a point. */
  function makeFlowerBed(cx: number, cz: number, count = 7, spread = 1.1): void {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * spread;
      makeFlower(cx + Math.cos(a) * r, cz + Math.sin(a) * r);
    }
  }

  function makeLilyPad(x: number, z: number, scale = 1): void {
    const pad = new THREE.Mesh(
      new THREE.CircleGeometry(0.35 * scale, 12),
      new THREE.MeshStandardMaterial({ color: COLORS.lilyPad, roughness: 0.7 }),
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(x, 0.03, z);
    park.add(pad);
  }

  function makeFountain(x: number, z: number): void {
    const fountain = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({
      color: COLORS.fountainStone,
      roughness: 0.8,
    });
    const waterMat = new THREE.MeshStandardMaterial({
      color: COLORS.pond,
      roughness: 0.15,
      metalness: 0.3,
    });

    // Outer basin wall + water.
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.5, 24), stoneMat);
    basin.position.y = 0.25;
    basin.castShadow = true;
    basin.receiveShadow = true;
    fountain.add(basin);

    const water = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.42, 24), waterMat);
    water.position.y = 0.3;
    fountain.add(water);

    // Central pedestal with a smaller upper bowl.
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 1.1, 16), stoneMat);
    pedestal.position.y = 0.9;
    pedestal.castShadow = true;
    fountain.add(pedestal);

    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.4, 0.28, 20), stoneMat);
    bowl.position.y = 1.5;
    bowl.castShadow = true;
    fountain.add(bowl);

    const topWater = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.14, 20), waterMat);
    topWater.position.y = 1.62;
    fountain.add(topWater);

    const spout = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), waterMat);
    spout.position.y = 1.8;
    fountain.add(spout);

    fountain.position.set(x, 0, z);
    park.add(fountain);
    addObstacle(x, z, 2.5);
  }

  function makePicnic(x: number, z: number): void {
    const picnic = new THREE.Group();
    const blanket = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 2.2, 4, 4),
      new THREE.MeshStandardMaterial({ color: COLORS.blanket, roughness: 0.95 }),
    );
    blanket.rotation.x = -Math.PI / 2;
    blanket.position.y = 0.02;
    blanket.receiveShadow = true;
    picnic.add(blanket);

    // A couple of stripes for a checkered feel.
    const stripeMat = new THREE.MeshStandardMaterial({
      color: COLORS.blanketStripe,
      roughness: 0.95,
    });
    for (const off of [-0.55, 0.55]) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.35), stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.025, off);
      picnic.add(stripe);
    }

    // A little basket.
    const basket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.24, 0.3, 12),
      new THREE.MeshStandardMaterial({ color: COLORS.benchWood, roughness: 0.9 }),
    );
    basket.position.set(0.6, 0.17, 0.4);
    basket.castShadow = true;
    picnic.add(basket);

    picnic.position.set(x, 0, z);
    picnic.rotation.y = Math.random() * Math.PI * 2;
    park.add(picnic);
  }

  /** A ring of short wooden fence posts marking the park boundary. */
  function makeFence(radius: number, posts = 40): void {
    const postMat = new THREE.MeshStandardMaterial({ color: COLORS.fencePost, roughness: 0.9 });
    const postGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.9, 6);
    for (let i = 0; i < posts; i++) {
      const a = (i / posts) * Math.PI * 2;
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(Math.cos(a) * radius, 0.45, Math.sin(a) * radius);
      post.castShadow = true;
      park.add(post);
    }
  }

  // --- Populate the park ---
  // Trees: a dense outer belt plus a few mid-ground clusters for depth.
  const treeSpots: [number, number][] = [
    // Outer belt
    [22, 0],
    [19, 15],
    [12, 22],
    [0, 25],
    [-13, 21],
    [-21, 13],
    [-24, -3],
    [-20, -16],
    [-9, -23],
    [4, -24],
    [16, -19],
    [24, -9],
    // Mid-ground accents
    [13, 6],
    [-11, 9],
    [8, -12],
    [-14, -9],
    [15, -4],
    [-6, 15],
  ];
  treeSpots.forEach(([x, z], i) => makeTree(x, z, 0.9 + (i % 4) * 0.28));

  // Bushes scattered between the plaza and the tree line.
  const bushSpots: [number, number][] = [
    [6, 2],
    [5.5, -4],
    [-5.5, 3],
    [-4.5, -5],
    [2, 6],
    [-2, -6],
    [8, 6],
    [-8, -2],
    [11, -8],
    [-12, 4],
    [9, 11],
    [-10, -12],
    [14, 2],
    [-15, 8],
  ];
  bushSpots.forEach(([x, z], i) => makeBush(x, z, 0.9 + (i % 3) * 0.35));

  // Flower beds brightening the lawns and path spokes.
  const flowerBeds: [number, number][] = [
    [7, 7],
    [-7, 6],
    [6, -8],
    [-8, -7],
    [12, 12],
    [-13, 11],
    [11, -13],
    [-12, -12],
    [0, 13],
    [13, 0],
  ];
  flowerBeds.forEach(([x, z]) => makeFlowerBed(x, z, 6 + ((Math.random() * 4) | 0)));

  // Rocks dotted around the lawns and pond edge.
  const rockSpots: [number, number][] = [
    [16, 8],
    [-16, -5],
    [9, -16],
    [-10, 16],
    [20, -12],
    [-19, 6],
    [4, 18],
    [-3, -17],
  ];
  rockSpots.forEach(([x, z], i) => makeRock(x, z, 0.8 + (i % 3) * 0.5));

  // Pond dressing: rocks around the rim and lily pads on the water.
  const pc = pondCenter;
  makeRock(pc.x + 4.8, pc.z + 1.5, 1.3);
  makeRock(pc.x - 3.5, pc.z - 4.2, 1.1);
  makeRock(pc.x + 1.5, pc.z - 5.0, 0.9);
  makeLilyPad(pc.x + 1.4, pc.z + 0.8, 1.1);
  makeLilyPad(pc.x - 1.8, pc.z - 0.6, 0.9);
  makeLilyPad(pc.x + 0.2, pc.z - 2.2, 1.0);

  // A decorative fountain as a second focal point.
  makeFountain(15, 14);

  // A picnic blanket tucked on the lawn.
  makePicnic(-13, 13);

  // Benches facing the plaza (south bench seats the feeding person).
  makeBench(0, 5.4, Math.PI);
  makeBench(0, -4.6, 0);
  makeBench(5.4, 0, -Math.PI / 2);
  makeBench(-5.4, 0, Math.PI / 2);
  // Extra benches along the outer path.
  makeBench(10, 10, -Math.PI * 0.75);
  makeBench(-10, 10, Math.PI * 0.75);

  // Lampposts on the inner path corners and out along the belt.
  makeLamp(7.5, 7.5);
  makeLamp(-7.5, 7.5);
  makeLamp(7.5, -7.5);
  makeLamp(-7.5, -7.5);
  makeLamp(16, 0);
  makeLamp(-16, 0);
  makeLamp(0, 16);
  makeLamp(0, -16);

  // Boundary fence around the park.
  makeFence(GROUND_RADIUS + 1, 48);

  return park;
}

