import * as THREE from 'three';

class Ship {
  constructor(scene, x, y, z) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.z = z;

    // TODO change to triangle
    const geometry = new THREE.BoxGeometry(20, 20, 20);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.set(x, y, z);
    this.scene.add(this.cube);
  }

  update() {

  }
}

export class Port {
  constructor(scene, x, y, z) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.z = z;

    const geometry = new THREE.BoxGeometry(20, 20, 20);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0f00
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.set(x, y, z);
    this.scene.add(this.cube);
  }

}