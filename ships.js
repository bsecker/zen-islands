import * as THREE from 'three';
import * as PATH from './pathfinding'

export class NavigationController {
  constructor(terrain, ports) {
    this.graph = new PATH.Graph(this.convertTerrainWeights(terrain), { diagonal: true});
    this.ports = ports;

    // pathfind between all ports
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

    // kick off initial ship generation at the same time
    // TODO change this in the future to not start at the same time if it looks weird
    // this.ports.forEach(port => {
    //   port.createShip(scene);
    // });
  }

  /**
   * Update ships in all ports, and delete ships when they're finished their path
   */
  updateShips(scene) {
    this.ports.forEach(port => {
      
      // if one of the ships is dead, filter the list to just alive after updating all ships.
      // is there a better way to do this?
      let prune = false
      port.ships.forEach(ship => {
        ship.update()
        if (!ship.alive) {
          scene.remove(ship.cube)
          prune = true;
        }
      })
      if (prune) port.ships = port.ships.filter(ship => ship.alive);
    })
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

// TODO figure out how how the coordinate systems of THREE.js works.
// AFAICT - y is up. z = depth

class Ship {
  constructor(scene, x, y, z, path) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.z = z;
    this.path = path;

    this.orientation = 0;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.alive = true;
    this.health = 100;

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
    if (this.health <=0) {
      this.alive = false
      console.log("dead", this.x, this.y);
      return
    }
    this.health--;
    this.x--;
    this.cube.position.set(this.x, this.y, this.z)
  }
}

export class Port {
  constructor(scene, x, y=0, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.paths = []; // TODO currently set by nav controller constructor, fix this
    this.ships = [];
    this.scene = scene;
  }

  get locationString() {
    return `${this.x},${this.y},${this.z}`;
  }

  createShip() {
    // create ship with a random path
    const ship = new Ship(this.scene, this.x, this.y, this.z, this.paths[Math.floor(Math.random() * this.paths.length)]);
    console.log("created ship at port", this.locationString, "following path", ship.path.length, "nodes long");
    setTimeout(() => {
      this.ships.push(ship);
      this.createShip();
    }, Math.random() * 10000);
  }

  update() {
    // delete dead ships is this expensive?
    this.ships = this.ships.filter(ship => ship.alive);
  }
}

// potential optomisation for a future version which means we don't have to pathfind between two ports twice
// class Channel {
//   constructor(end1, end2, points) {
//     this.end1 = end1;
//     this.end2 = end2;
//     this.points = points;
//   }
// }