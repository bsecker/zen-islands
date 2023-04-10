import * as THREE from 'three';
import { SimplexNoise } from './noise'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Port } from './ships';

const WIDTH = 4096;
const HEIGHT = 4096;
const RENDER_WATER = false;

// create the scene
const scene = new THREE.Scene();
const ports = [];
const ships = [];

// create the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
// camera.position.z = 5;
camera.position.y = 2000;
camera.position.z = 100;
camera.rotation.x = -25 * Math.PI / 180;

// create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit camera
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minZoom = 10;
controls.mouseButtons = {
	RIGHT: THREE.MOUSE.ROTATE,
	MIDDLE: THREE.MOUSE.DOLLY,
	LEFT: THREE.MOUSE.PAN
}
// camera.position.set( 0, 20, 100 );
controls.update();


// create water mesh
if (RENDER_WATER) {
    const watergeometry = new THREE.PlaneGeometry(WIDTH, HEIGHT);
    const watermaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
    const water = new THREE.Mesh(watergeometry, watermaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 10;
    scene.add(water);
}

// create a basic lighting setup
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
// scene.add(ambientLight);
var light = new THREE.DirectionalLight(0xffffff, 2.3);
light.position.set(camera.position.x, camera.position.y + 500, camera.position.z + 500).normalize();
scene.add(light);


const perlin = new SimplexNoise();

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * given a set of coordinates (x,y), return a normalised value between 0 and 1 of the distance to the center (0,0), where 1 is at the center and 0 is at the edge
 * @param {*} x 
 * @param {*} y 
 */
function islandise_round(x, y) {
    const dist = distance(0, 0, x, y);
    const maxDist = WIDTH / 2;
    // if distance is larger than the max distance, scale it back to 0 quicker
    if (dist > maxDist) {
        return 5/dist
    }

    // normalise
    return 1.00 - (dist / maxDist);
}

/**
 * given a set of coords (x,y), apply a square mask to the coords so that the edges are lower than the center
 */
function islandise_square(x,y) {
    const distance_x = Math.abs(-x);
    const distance_y = Math.abs(-y);

    const distance = Math.max(distance_x, distance_y);
    const max_width = (WIDTH * 0.5);
    const delta = distance / max_width;
    const gradient = delta * delta;

    return Math.max(0, 1.0-gradient);
}

function getColor(height) {
    let color = 0x000000;
    switch(true) {
        case height < 1: color = 0x0000ff; break; // water 
        case height < 10: color = 0x505050; break; // sand
        case height < 100: color = 0x074709; break // grass
        case height < 150: color = 0x295e2b; break; // darker grass
        case height < 170: color = 0x697f6a; break; // dirt
        default: color = 0xffffff; // snow
    }

    return color;
}

function generate_terrain() {
    console.log("generating terrain...")

    // create land mesh
    const geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT, 2048, 2048);
    const material = new THREE.MeshLambertMaterial({ vertexColors: true });
    // const material = new THREE.MeshLambertMaterial({ color: 0x505050 });


    var vertices = geometry.attributes.position.array;

    const color = new THREE.Color();
    const colors = [];

    for (let i = 0; i <= vertices.length; i += 3) {
        vertices[i + 2] = perlin.sum_octave(
            7,
            vertices[i],
            vertices[i + 1],
            0.501,
            0.0008,
            -300,
            300
        ) 
        * islandise_round(vertices[i], vertices[i + 1])

        if (vertices[i + 2] < 0) {
            vertices[i + 2] = 0;
        }

        // color vertices based on height
        color.setHex(getColor(vertices[i+2]));
        // console.log("height", vertices[i+2], "color", color.r, color.g, color.b)
        colors.push(color.r, color.g, color.b);

    }
    
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(0, 0, 0);
    scene.add(terrain);

    terrain.geometry.attributes.position.needsUpdate = true;
    terrain.geometry.computeVertexNormals();

    return terrain;
}

/**
 * I guess a better algorithm would be:
 * - run a convolution filter over the array, take the average of points, if close to 0 then add to list
 */

function generate_ports(terrain) {
    console.log("generating ports...")

    const vertices = terrain.geometry.attributes.position.array;

    // generate a list of coordinates where y = 1
    const shore_coords = [];
    for (let i=0; i<=vertices.length; i+=3) {
        if (vertices[i+2] > 1 && vertices[i+2] < 2) {
            shore_coords.push([vertices[i], vertices[i+1], vertices[i+2]]);
        }
    }

    console.log(shore_coords.length)

    for (let i=0; i<30; i++) {

        // pick a random coordinate from the list
        const coord = shore_coords[Math.floor(Math.random() * shore_coords.length)];
        console.log("found", coord);

        // TODO remove picked from list

        const port = new Port(scene, coord[0], coord[2], -coord[1]);
        ports.push(port);
    }
}

function generate_node_graph() {
    console.log("calculating pathfinding graph...")

    const water_verticies = terrain.geometry.attributes.position.array;
    const water_points = [];

    for (let i=0; i < water_verticies.length; i+=3) {
        if (water_verticies[i+2] <= 0) {
            water_points.push([water_verticies[i], water_verticies[i+1], water_verticies[i+2]]);
        }
    }

    console.log("water points", water_points.length)
    return water_points;
}

/**
 * Iterate through all faces in the mesh, and if the face has all y coords equal to 0, add to list
 */
function get_water_faces(terrain) {
    const faces = terrain.geometry.attributes.position.array;
    console.log(faces.slice(0, 30));
}

function animate() {

    requestAnimationFrame(animate);

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    renderer.render(scene, camera);

}

const terrain = generate_terrain();
generate_ports(terrain);
generate_node_graph();
// get_water_faces(terrain);
animate();