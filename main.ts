// @ts-ignore
import { SimplexNoise } from './noise'
import { GameRenderer } from './render';
import { generateTerrain, generatePorts } from './terrain';
import { NavigationController } from './ships';

const WIDTH  = 1024;
const HEIGHT = 1024;
const PORTS = 4;

// create the scene
const renderer = new GameRenderer(document, window, WIDTH, HEIGHT);

// generate terrain
const noise = new SimplexNoise();
const terrain = generateTerrain(noise, WIDTH, HEIGHT);
console.table(terrain.slice(0, 10))

const ports = generatePorts(terrain, PORTS, renderer.scene);
const nav = new NavigationController(terrain, ports);
renderer.navController = nav;

// kick off ship generation after some time
ports.forEach(port => {setTimeout(() => port.createShip(), Math.random() * 10000)});


// add height mesh
const mesh = renderer.generateMeshFromHeightMap(terrain);
renderer.scene.add(mesh);

// renderer.generatePortMeshes(ports);
// renderer.renderExamplePath(nav.exampleSearch);

renderer.animate();