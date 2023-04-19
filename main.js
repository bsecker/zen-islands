import { SimplexNoise } from './noise'
import { GameRenderer } from './render';
import { generateTerrain, generatePorts } from './terrain';
import { NavigationController } from './ships';

const WIDTH = 4096;
const HEIGHT = 4096;
const RENDER_WATER = false;

// create the scene
const ships = [];

const renderer = new GameRenderer(document, window);
const noise = new SimplexNoise();


const terrain = generateTerrain(noise, WIDTH, HEIGHT);
const ports = generatePorts(terrain);
const nav = new NavigationController(terrain);
// const terrain = [
//     [1, 2, 3, 2, 1],
//     [1, 2, 3, 2, 1],
//     [1, 2, 3, 2, 1],
//     [1, 2, 3, 2, 1],
//     [1, 2, 3, 2, 1],
// ]

// console.table(terrain[0]);

const mesh = renderer.generateMeshFromHeightMap(terrain);
renderer.scene.add(mesh);
renderer.generatePortMeshes(ports);
renderer.renderExamplePath(nav.exampleSearch);

renderer.animate();