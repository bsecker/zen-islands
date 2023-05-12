// Rendering code
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { NavigationController } from './ships';
import { GUI } from 'dat.gui'

export class GameRenderer {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  light: THREE.DirectionalLight;
  mapWidth: number;
  mapHeight: number;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  gui: GUI;
  sky: THREE.Mesh;
  navController: NavigationController | undefined; // set after constructor - code smell. Is there any way to fix this?

  waterOverlay: THREE.Mesh;
  params: {
    waterOverlayColor: string,
    waterOverlayOpacity: number,
    waterHue: number,
    cameraRotate: boolean,
    skyColor: number,
    backgroundWaterColor: number,
    skyOffset: number,
    skyExponent: number,
  }
  
  constructor(document: Document, window: Window, mapWidth: number, mapHeight: number) {
    this.params = {
      waterOverlayColor: '#373a53',
      waterOverlayOpacity: 0.5,
      waterHue: 0.527,
      cameraRotate: true,
      skyColor: 0x43b6f2,
      backgroundWaterColor: 0xebbfb6,
      skyOffset: 1329,
      skyExponent: 0.54,
    }

    this.scene = new THREE.Scene();
    this.camera = this.createCamera();
    this.light = this.createLighting();
    this.sky = this.createSky(document);
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;


    // create the renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = this.createOrbitControls();
    
    this.waterOverlay = this.createSea(mapWidth, mapHeight);

    // controls
    this.gui = new GUI();
    this.gui.addFolder("Colors")
    this.gui.addColor(this.params, 'waterOverlayColor').onChange((value) => {
      this.waterOverlay.material.color.set(value);
    });
    this.gui.add(this.params, 'waterOverlayOpacity', 0, 1).onChange((value) => {
      this.waterOverlay.material.opacity = value;
    });
    this.gui.addColor(this.params, 'skyColor').onChange((value) => {
      this.sky.material.uniforms.topColor.value.set(value);
    });
    this.gui.addColor(this.params, 'backgroundWaterColor').onChange((value) => {
      this.sky.material.uniforms.bottomColor.value.set(value);
    });
    this.gui.add(this.params, 'skyOffset', -2000, 2000).onChange((value) => {
      this.sky.material.uniforms.offset.value = value;
    });
    this.gui.add(this.params, 'skyExponent', 0, 1).onChange((value) => {
      this.sky.material.uniforms.exponent.value = value;
    });
    this.gui.addFolder('Camera');
    this.gui.add(this.params, 'cameraRotate').onChange((value) => {
      this.controls.autoRotate = value;
    });
    this.gui.open();

    // sky.material.uniforms[ 'topColor' ]

    // add snowglobe
    // const spheregeometry = new THREE.SphereGeometry(mapWidth/2, 20, 20, 0, Math.PI*2,);
    // // const spheregeometry = new THREE.
    // const spherematerial = new THREE.MeshLambertMaterial({
    //   color: 0x0000ff,
    //   side: THREE.DoubleSide,
    //   opacity: 0.25,
    //   transparent: true
    // })
    // const sphere = new THREE.Mesh(spheregeometry, spherematerial);
    // sphere.position.set(mapWidth/2, 0, mapHeight/2);
    // this.scene.add(sphere);

    window.onresize = () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    };
  }

  private createSea(mapWidth: number, mapHeight: number) {
    const watergeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
    const watermaterial = new THREE.MeshLambertMaterial({ color: 0x1890A8, side: THREE.DoubleSide, opacity: 0.55, transparent: true });
    const water = new THREE.Mesh(watergeometry, watermaterial);
    water.position.set(0.5 * mapWidth, 0, 0.5 * mapHeight);
    water.rotation.x = -Math.PI / 2;
    // water.position.y = 10;
    this.scene.add(water);
    return water;
  }

  private createCamera() {
    // create the camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 15000);
    // camera.position.z = 5;
    // camera.position.x = 1000;
    camera.position.y = 700;
    // camera.position.z = 1000;
    // camera.translateOnAxis(new THREE.Vector3(1, 1, 1), 0.5 * this.mapWidth);
    // camera.translateX(0.5 * this.mapWidth);
    // camera.translateZ(0.5 * this.mapHeight);
    return camera;
  }

  private createOrbitControls() {
    // Orbit camera
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;
    controls.target = new THREE.Vector3(this.mapWidth/2,0,this.mapHeight/2)
    controls.maxDistance = 1750;
    controls.minDistance = 50;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4; 
    controls.maxPolarAngle = (Math.PI/2)*0.95; // prevent <0 vertical
    controls.mouseButtons = {
      RIGHT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      LEFT: undefined // THREE.MOUSE.PAN // prevent
    }
    controls.update();
    return controls;
  }

  private createSky(document: Document) {
    // hemisphere light & sky
    const hemisphereLight = new THREE.HemisphereLight(0x0bb5e0, 0x0b4be0);
    this.scene.add(hemisphereLight);

    const vertexShader = document.getElementById( 'vertexShader' )!.textContent || undefined;
    const fragmentShader = document.getElementById( 'fragmentShader' )!.textContent || undefined;
    const uniforms = {
      'topColor': { value: new THREE.Color(this.params.skyColor) },
      // 'bottomColor': { value: new THREE.Color( 0xffffff ) },
      'bottomColor': { value: new THREE.Color( this.params.backgroundWaterColor ) },
      'offset': { value: this.params.skyOffset },
      'exponent': { value: this.params.skyExponent }
    };
    uniforms[ 'topColor' ].value.copy( hemisphereLight.color );


    const skyGeo = new THREE.SphereGeometry( 8000, 32, 15 );
    const skyMat = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.BackSide
    } );

    const sky = new THREE.Mesh( skyGeo, skyMat );
    console.log("mapWidth", this.mapWidth, "mapHeight", this.mapHeight);
    // TODO: figure out why this is undefined
    // sky.position.set(this.mapWidth/2,0,this.mapHeight/2);
    sky.position.set(1024,0,1024);
    this.scene.add( sky );
    return sky;
  }

  private createLighting() {
    // create a basic lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);
    const light = new THREE.DirectionalLight(0xffffff, 2.3);
    // light.position.set(this.camera.position.x, this.camera.position.y + 500, this.camera.position.z + 500).normalize();
    // light.position.set(0, 1000, 0)
    this.scene.add(light);

    // background and fog
    this.scene.background = new THREE.Color('#0000FF')
    // this.scene.fog = new THREE.Fog(0xFFFFFF, 5000, 10000)
    // this.scene.fog.color.copy( uniforms[ 'bottomColor' ].value );
    return light;


  }

  private getColor(height: number, minHeight=-300, maxHeight=300) {
    
    // 
    const waterHeight = (height: number, minHeight: number) => new THREE.Color().setHSL(this.params.waterHue, 0.75, (Math.abs(minHeight) - Math.abs(height))/Math.abs(minHeight)*0.2).getHex();

    // const heightHSL = (height, hue, sat, min) => new THREE.Color().setHSL(hue, sat, (Math.abs(min) - Math.abs(height))/Math.abs(min)*0.3).getHex();

    let color = 0x000000;
    switch (true) {
      // case height < -100: color = 0x00001f; break; // deepest water
      // case height < -50: color = 0x00001c; break; // deeper water
      // case height < -10: color = 0x00005c; break; // deep water
      case height < 1: color = waterHeight(height, minHeight); break; // water 
      // case height < 1: color = 0x0000ff; break;
      case height < 10: color = 0xefe097; break; // sand
      // case height < 170: color = heightHSL(height, 0.4, 0.5, maxHeight); break;
      // case height < 100: color = 0x074709; break; // grass
      // case height < 150: color = 0x295e2b; break; // darker grass
      // case height < 170: color = 0x697f6a; break; // dirt
      default: color = new THREE.Color().setHSL(0.336, 0.678, 0.1 + 0.3*(height/maxHeight)).getHex();
    }

    return color;
  }

  /**
   * Generate a very large horizontal blue plane to represent the sea
   */
  private createLargeSea() {
    const geometry = new THREE.PlaneGeometry(10000, 10000);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.FrontSide });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI / 2;

    return plane;
  }

  generateMeshFromHeightMap(heightmap: number[][]) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true });
    const mapWidth = heightmap[0].length;
    const mapHeight = heightmap.length;



    // generate vertices
    console.log("generating vertices...")
    const vertices = new Float32Array(mapWidth * mapHeight * 3);
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const height = heightmap[y][x];
        const index = ((y * mapHeight) + x) * 3;
        vertices[index] = x // - (0.5 * mapHeight);
        vertices[index + 1] = height //Math.max(height, 0);
        vertices[index + 2] = y // - (0.5 * mapWidth);
      }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

    // generate faces
    console.log("generating faces...")
    const faces = new Uint32Array((mapWidth - 1) * (mapHeight - 1) * 6);
    for (let y = 0; y < mapHeight - 1; y++) {
      for (let x = 0; x < mapWidth - 1; x++) {
        const index = ((y * (mapHeight - 1)) + x) * 6;
        const v1 = x + y * mapWidth;
        const v2 = (x + 1) + y * mapWidth;
        const v3 = x + (y + 1) * mapWidth;
        const v4 = (x + 1) + (y + 1) * mapWidth;

        // two triangles per square, with reversed indices to make them face outwards
        // thanks chatgpt - https://chat.openai.com/c/3b0806e6-3f4e-4f8d-849d-c8e4c7356b00
        faces[index] = v1;
        faces[index + 1] = v3;
        faces[index + 2] = v2;
        faces[index + 3] = v2;
        faces[index + 4] = v3;
        faces[index + 5] = v4;
      }
    }
    geometry.setIndex(new THREE.BufferAttribute(faces, 1));

    // generate colors
    console.log("generating colors...")
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

    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }

  // generatePortMeshes(ports) {
  //   ports.forEach(port => {
  //   })
  // }

  // renderExamplePath(path) {
  //   var points = [];
  //   for (let i = 0; i < path.length; i++) {
  //     points.push(new THREE.Vector3(path[i].x, 0, path[i].y))
  //   }

  //   let geometry = new THREE.BufferGeometry().setFromPoints( points );
  //   let material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
  //   let line = new THREE.Line( geometry, material );
  //   this.scene.add( line );
  // }

  animate() {


    // required if controls.enableDamping or controls.autoRotate are set to true
    this.controls.update();

    this.renderer.render(this.scene, this.camera);

    // is this pattern ok? strong coupling?
    if (this.navController) {
      this.navController.updateShips(this.scene);
    }

    // putting this last so that the program will stop if there's an error rather than continuing to render
    requestAnimationFrame(this.animate.bind(this));

  }
}