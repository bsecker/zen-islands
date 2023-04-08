class Boat {

}

class Port {
  constructor(scene, x, y, z) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.z = z;

    const geometry = new THREE.BoxGeometry(20, 20, 20);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
  }

}