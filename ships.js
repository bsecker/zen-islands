import * as THREE from 'three';
import * as PATH from './pathfinding'

export class NavigationController {
  constructor(terrain) {
    this.graph = new PATH.Graph(this.convertTerrainWeights(terrain), { diagonal: true});
    this.start = this.graph.grid[0][0];
    this.end = this.graph.grid[4095][4095]
    this.exampleSearch = PATH.astar.search(this.graph, this.start, this.end);
    console.log(this.exampleSearch);
  }

  /**
   * Given a 2d array of weights, convert to something the pathfinding library understands.
   * @param {*} terrain 
   */
  convertTerrainWeights(terrain) {
    console.log("converting pathfinding weights...")
    const converted = [];
    for (let y=0; y<terrain.length; y++) {
      const row = [];
      for (let x=0; x<terrain[0].length; x++) {
        row.push(this.convertHeightToWeight(terrain[y][x]));
      }
      converted.push(row);
    }
    return converted;
  }

  /**
   * A few notes about weight values:
   * - A weight of 0 denotes a wall.
   * - A weight cannot be negative.
   * - A weight cannot be between 0 and 1 (exclusive).
   * - A weight can contain decimal values (greater than 1).
   * 
   * Based on this, the following rules are applied:
   * - if weight is > 1, return 0 (land)
   * @param {*} height 
   */
  convertHeightToWeight(height) {
    
    const maxWeight = 10;

    // islands are walls
    if (height >= 0) {
      return 0; 
    } 
    // prefer deeper water
    return 1 + (maxWeight / Math.abs(height));
  }
}

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
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

}