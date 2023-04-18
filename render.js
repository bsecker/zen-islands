// Rendering code
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class GameRenderer {
  constructor(document, window) {
    this.scene = new THREE.Scene();
    this.camera = this.createCamera();
    this.light = this.createLighting(); 

    // create the renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = this.createOrbitControls(this.camera, this.renderer);
  
    // TODO
    // window.onresize = function() {
    //   this.renderer.setSize(window.innerWidth, window.innerHeight);
    //   camera.aspect = window.innerWidth / window.innerHeight;
    //   camera.updateProjectionMatrix();
    // } 
  }

  createCamera() {
    // create the camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    // camera.position.z = 5;
    camera.position.y = 2000;
    camera.position.z = 100;
    camera.rotation.x = -25 * Math.PI / 180;

    return camera;
  }

  createOrbitControls() {
    // Orbit camera
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.minZoom = 10;
    controls.mouseButtons = {
	    RIGHT: THREE.MOUSE.ROTATE,
	    MIDDLE: THREE.MOUSE.DOLLY,
	    LEFT: THREE.MOUSE.PAN
    }
    controls.update();
    return controls;
  }

  createLighting() {
    // create a basic lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    const light = new THREE.DirectionalLight(0xffffff, 2.3);
    // light.position.set(this.camera.position.x, this.camera.position.y + 500, this.camera.position.z + 500).normalize();
    // light.position.set(0, 1000, 0)
    this.scene.add(light);
    return light;
  }

  getColor(height) {
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

  generateMeshFromHeightMap(heightmap) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const mapWidth = heightmap[0].length;
    const mapHeight = heightmap.length;


    // generate vertices
    const vertices = new Float32Array(mapWidth * mapHeight * 3);
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const height = heightmap[y][x];
        const index = ((y * mapHeight) + x) * 3;
        vertices[index] = x;
        vertices[index + 1] = height;
        vertices[index + 2] = y;
      }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    // generate faces
    const faces = new Uint32Array((mapWidth - 1) * (mapHeight - 1) * 6);
    for (let y = 0; y < mapHeight - 1; y++) {
      for (let x = 0; x < mapWidth - 1; x++) {
        const index = ((y * (mapHeight - 1)) + x) * 6;
        const v1 = x + y * mapWidth;
        const v2 = (x + 1) + y * mapWidth;
        const v3 = x + (y + 1) * mapWidth;
        const v4 = (x + 1) + (y + 1) * mapWidth;

        // two triangles per square
        faces[index] = v1;
        faces[index + 1] = v2;
        faces[index + 2] = v3;
        faces[index + 3] = v2;
        faces[index + 4] = v4;
        faces[index + 5] = v3;
      }
    }
    geometry.setIndex(new THREE.BufferAttribute(faces, 1));

    // generate colors
    const colors = new Float32Array(mapWidth * mapHeight * 3);
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const height = heightmap[y][x];
        const color = this.getColor(height);
        const index = ((y * mapHeight) + x) * 3;
        colors[index] = (color >> 16 & 255) / 255;
        colors[index + 1] = (color >> 8 & 255) / 255;
        colors[index + 2] = (color & 255) / 255;
      }
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    material.vertexColors = true;
    
    
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;

  }



  // given a 2d heightmap, generate and return a mesh
  generateMeshFromHeightmapCoPilot(heightmap) {
    const geometry = new THREE.Geometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const width = heightmap.length;
    const height = heightmap[0].length;

    // generate vertices
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const height = heightmap[x][y];
        geometry.vertices.push(new THREE.Vector3(x, height, y));
      }
    }

    // generate faces
    for (let x = 0; x < width - 1; x++) {
      for (let y = 0; y < height - 1; y++) {
        const v1 = x + y * width;
        const v2 = (x + 1) + y * width;
        const v3 = x + (y + 1) * width;
        const v4 = (x + 1) + (y + 1) * width;

        // two triangles per square
        geometry.faces.push(new THREE.Face3(v1, v2, v3));
        geometry.faces.push(new THREE.Face3(v2, v4, v3));
      }
    }

    // set colors
    for (let i = 0; i < geometry.faces.length; i++) {
      const face = geometry.faces[i];
      const color = this.getColor(heightmap[face.a % width][Math.floor(face.a / width)]);
      face.color.setHex(color);
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return new THREE.Mesh(geometry, material);
  }

  // given a 2d heightmap, generate and return a mesh
  generateMeshFromHeightmapChatGPT(heightmap) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const width = heightmap.length;
    const height = heightmap[0].length;
  
    // generate vertices
    const vertices = new Float32Array(width * height * 3);
    let i = 0;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const height = heightmap[y][x];
        vertices[i++] = x;
        vertices[i++] = height;
        vertices[i++] = y;
      }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  
    // generate faces
    const indices = new Uint16Array((width - 1) * (height - 1) * 6);
    i = 0;
    for (let x = 0; x < width - 1; x++) {
      for (let y = 0; y < height - 1; y++) {
        const v1 = x + y * width;
        const v2 = (x + 1) + y * width;
        const v3 = x + (y + 1) * width;
        const v4 = (x + 1) + (y + 1) * width;
  
        // two triangles per square
        indices[i++] = v1;
        indices[i++] = v2;
        indices[i++] = v3;
        indices[i++] = v2;
        indices[i++] = v4;
        indices[i++] = v3;
      }
    }
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  
    // set colors
    const colors = new Float32Array(width * height * 3);
    i = 0;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const color = new THREE.Color();
        color.setHex(this.getColor(heightmap[x][y]));
        colors[i++] = color.r;
        colors[i++] = color.g;
        colors[i++] = color.b;
      }
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
    geometry.computeVertexNormals();
  
    return new THREE.Mesh(geometry, material);
  }

  animate() {


    // required if controls.enableDamping or controls.autoRotate are set to true
    this.controls.update();

    this.renderer.render(this.scene, this.camera);
    
    // putting this last so that the program will stop if there's an error rather than continuing to render
    requestAnimationFrame(this.animate.bind(this));

  }
}

// // create water mesh
// if (RENDER_WATER) {
//     const watergeometry = new THREE.PlaneGeometry(WIDTH, HEIGHT);
//     const watermaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
//     const water = new THREE.Mesh(watergeometry, watermaterial);
//     water.rotation.x = -Math.PI / 2;
//     water.position.y = 10;
//     scene.add(water);
// }