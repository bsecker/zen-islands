import * as THREE from 'three';
import * as PATH from './pathfinding'

export class NavigationController {
  constructor(terrain, ports) {
    this.graph = new PATH.Graph(this.convertTerrainWeights(terrain), { diagonal: true});
    this.ports = ports;

    const startport = this.ports[0];
    this.start = this.graph.grid[startport.x][startport.y];
    
    // choose random end port
    const endport = this.ports[Math.floor(Math.random() * this.ports.length)];
    this.end = this.graph.grid[endport.x][endport.y];

    console.log("start: ", this.start, "end: ", this.end);

    console.log("finding path...")
    this.exampleSearch = PATH.astar.search(this.graph, this.start, this.end, {
      // heuristic: PATH.astar.heuristics.diagonal
    });
    console.log(this.exampleSearch);

    this.ports.forEach(port => {
      const portNode = this.graph.grid[port.x][port.y];
      port.paths = [];
      this.ports.forEach(otherPort => {
        if (otherPort !== port) {
          const otherPortNode = this.graph.grid[otherPort.x][otherPort.y];
          console.log("pathfinding between ", port.locationString, " and ", otherPort.locationString, "...")
          const path = PATH.astar.search(this.graph, portNode, otherPortNode, {
            // heuristic: PATH.astar.heuristics.diagonal
          });
          if (path.length > 0) console.log("path found: ", path.length, " nodes")
          port.paths.push(path);
        }
      });
    });

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
        row.push(this.convertHeightToWeight(terrain[x][y]));
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
    
    const maxWeight = 1;

    // islands are walls
    if (height >= 1) {
      return 0; 
    } 
    // prefer deeper water
    return 1 + Math.abs(height) * 0.05;
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
  constructor(x, y, z=0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  get locationString() {
    return `${this.x},${this.y},${this.z}`;
  }
}

class Channel {
  constructor(end1, end2, points) {
    this.end1 = end1;
    this.end2 = end2;
    this.points = points;
  }
}