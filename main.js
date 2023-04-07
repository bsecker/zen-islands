import * as THREE from 'three';
import { SimplexNoise } from './noise'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const WIDTH = 5000;
const HEIGHT = 5000;

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
const controls = new OrbitControls( camera, renderer.domElement );
controls.minZoom = 10;
// camera.position.set( 0, 20, 100 );
controls.update();

// create land mesh
const geometry = new THREE.PlaneGeometry( WIDTH, HEIGHT, 256, 256 );
const material = new THREE.MeshLambertMaterial({color: 0x074709});
const terrain = new THREE.Mesh( geometry, material );
terrain.rotation.x = -Math.PI / 2;
scene.add( terrain );

// create water mesh
// const watergeometry = new THREE.PlaneGeometry( WIDTH, HEIGHT );
// const watermaterial = new THREE.MeshBasicMaterial( {color: 0x0000ff, side: THREE.DoubleSide} );
// const water = new THREE.Mesh( watergeometry, watermaterial );
// water.rotation.x = -Math.PI / 2;
// water.position.y = 10;
// scene.add( water );

// create a basic lighting setup
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
// scene.add(ambientLight);
var light = new THREE.DirectionalLight(0xffffff, 2.3);
light.position.set(camera.position.x, camera.position.y+500, camera.position.z+500).normalize();
scene.add(light);

// const pointLight = new THREE.PointLight(0xffffff, 1);
// pointLight.position.set(5, 5, 5);
// scene.add(pointLight);


const perlin = new SimplexNoise();
var peak = 100;
var smoothing = 200;
const frequency = 0.0015;
const amplitude = 150;
const octaves = 1;


function refreshVertices() {
    var vertices = terrain.geometry.attributes.position.array;
    
    for (let i=0; i<= vertices.length; i+=3) {
        vertices[i+2] = perlin.simplex_noise(
            terrain.position.x + vertices[i],
            terrain.position.z + vertices[i+1],
            frequency,
            amplitude,
            octaves
        )
    }

    terrain.geometry.attributes.position.needsUpdate = true;
    terrain.geometry.computeVertexNormals();
}

refreshVertices(peak, smoothing);
// renderer.render(scene, camera);

function animate() {

	requestAnimationFrame( animate );

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();

	renderer.render( scene, camera );

}
animate();