import * as THREE from 'three';
import { SimplexNoise } from './noise'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const WIDTH = 4096;
const HEIGHT = 4096;
const RENDER_WATER = true;

// create the scene
const scene = new THREE.Scene();

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
function islandise(x, y) {
    const dist = distance(0, 0, x, y);
    const maxDist = WIDTH / 2;
    // normalise
    return 1 - (dist / maxDist);
}

function getColor(height) {
    switch(height) {
        case height < 1: return 0x0000ff; // water 
        case height < 5: return 0x505050; // sand
        case height < 200: return 0x074709; // grass
        default: return 0xffffff; // snow
    }
}

function refreshVertices() {
    // create land mesh
    const geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT, 256, 256);
    const material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
    // const material = new THREE.MeshLambertMaterial({ color: 0x074709 });
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
            // * islandise(
            //     terrain.position.x + vertices[i],
            //     terrain.position.y + vertices[i + 1],
            // )

        if (RENDER_WATER && vertices[i + 2] < 0) {
            vertices[i + 2] = 0;
        }

        // color vertices based on height
        color.setHex(vertices[i+2])
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

refreshVertices();
// renderer.render(scene, camera);

function animate() {

    requestAnimationFrame(animate);

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    renderer.render(scene, camera);

}
animate();