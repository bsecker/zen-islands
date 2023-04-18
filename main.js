import * as THREE from 'three';
import { SimplexNoise } from './noise'
import { Port } from './ships';
import { GameRenderer } from './render';
import { generateTerrain } from './terrain';
const WIDTH = 4096;
const HEIGHT = 4096;
const RENDER_WATER = false;

// create the scene
const ports = [];
const ships = [];

const renderer = new GameRenderer(document, window);

const noise = new SimplexNoise();


const terrain = generateTerrain(noise, WIDTH, HEIGHT);
// const terrain = [
//     [1, 2, 3, 2, 1],
//     [1, 2, 3, 2, 1],
//     [1, 2, 3, 2, 1],
//     [1, 2, 3, 2, 1],
//     [1, 2, 3, 2, 1],
// ]

// console.table(terrain);

// const mesh = renderer.generateTerrainMesh(terrain);
const mesh = renderer.generateMeshFromHeightMap(terrain);
renderer.scene.add(mesh);


// generate_ports(terrain);
// generate_node_graph();
// get_water_faces(terrain);
renderer.animate();