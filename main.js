import * as THREE from 'three';
import { SimplexNoise } from './noise'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const WIDTH = 4096;
const HEIGHT = 4096;
const RENDER_WATER = false;

// create the scene
const scene = new THREE.Scene();
const ports = [];

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
controls.minZoom = 10;
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

// const pointLight = new THREE.PointLight(0xffffff, 1);
// pointLight.position.set(5, 5, 5);
// scene.add(pointLight);


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
}

function generate_cities() {
}

generate_terrain();
// renderer.render(scene, camera);

function animate() {

    requestAnimationFrame(animate);

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    renderer.render(scene, camera);

}
animate();