import { SimplexNoise } from './noise'
import { GameRenderer } from './render';
import { generateTerrain, generatePorts } from './terrain';
import { NavigationController } from './ships';

const WIDTH = 2048;
const HEIGHT = 2048;

// create the scene
const ships = [];

const renderer = new GameRenderer(document, window, WIDTH, HEIGHT);
const noise = new SimplexNoise();


const terrain = generateTerrain(noise, WIDTH, HEIGHT);
const ports = generatePorts(terrain, 5);
const nav = new NavigationController(terrain, ports);
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