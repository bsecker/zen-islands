import * as THREE from 'three';
import * as PATH from './pathfinding'

export class NavigationController {
  constructor(terrain, ports) {
    const weightedGraph = this.convertTerrainWeights(terrain);
    // console.table(weightedGraph.slice(0, 10));
    this.graph = new PATH.Graph(weightedGraph, { diagonal: false});
    this.ports = ports;

    // pathfind between all ports
    this.ports.forEach(port => {
      const portNode = this.graph.grid[port.x][port.z];
      port.paths = [];
      this.ports.forEach(otherPort => {
        if (otherPort !== port) {
          
          // try find a path between port and other with A* algorithm
          const otherPortNode = this.graph.grid[otherPort.x][otherPort.z];
          console.log("pathfinding between ", port.locationString, " and ", otherPort.locationString, "...")
          const path = PATH.astar.search(this.graph, portNode, otherPortNode, {
            heuristic: PATH.astar.heuristics.diagonal
          });

          // path found, add to paths
          if (path.length > 0) {
            console.log("    path found: ", path.length, " nodes")
            port.paths.push(path);
          }
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
  convertHeightToWeight(height, heightmin=30, heightmax=1) {
    
    const maxWeight = 1;

    // islands are walls
    if (height >= 1) {
      return 0; 
    } 

    // map height between heightmin and heightmax
    // Y = (X-A)/(B-A) * (D-C) + C
    // height = Math.abs(height);
    // height = (height - 1)/299 * (heightmax-heightmin) + 1

    // prefer deeper water
    // switch(true) {
    //   case height < 50: return 1;
    //   case height < 20: return 2;
    //   case height < 10: return 3;
    //   case height < 0: return 4;
    //   default: return 1
    // }
    return 1 + 1 / Math.abs(height * 0.25) //+ (1 / Math.abs(height) * 0.5);

    
  }
}

class Ship {
  constructor(scene, x, y, z, path) {
    this.scene = scene;
    this.path = path;
    this.targetIndex = 0;

    this.orientation = 0;

    this.position = new THREE.Vector3(x,y,z);
    this.velocity = new THREE.Vector3(0,0,0);
    this.accel = new THREE.Vector3(0,0,0);

    this.alive = true;
    this.targetMoveSpeed = 1 + Math.floor(Math.random() * 2);
    this.maxSpeed = 1;
    this.maxForce = 0.2;

    // TODO change to triangle
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.set(x, y, z);
    this.scene.add(this.cube);
  }

  update() {

    // console.log(this.position, this.velocity, this.accel)

    if (this.targetIndex >= this.path.length) {
      // reached end, so kill
      this.alive = false
      console.log("dead", this.position.x, this.position.y);
      return;
    }

    // this.position.x = this.path[this.target].x;
    // this.position.z = this.path[this.target].y;

    const target = new THREE.Vector3(this.path[this.targetIndex].x, 0, this.path[this.targetIndex].y);

    // const desired = target.sub(this.position);
    const desired = new THREE.Vector3().subVectors(target, this.position);
    desired.normalize()
    desired.multiplyScalar(this.maxSpeed);

    const steer = new THREE.Vector3().subVectors(desired, this.velocity);

    steer.clampLength(0, this.maxForce); // TODO or is it clampScalar?
    
    // apply force
    this.accel.add(steer);

    // Update velocity
    this.velocity.add(this.accel);
    // Limit speed
    this.velocity.clampLength(0, this.maxSpeed);
    this.position.add(this.velocity);
    // Reset acceleration to 0 each cycle
    this.accel.multiplyScalar(0);

    // update graphics to match
    this.cube.position.set(this.position.x, this.position.y, this.position.z);
    // this.cube.lookAt(this.velocity);

    this.targetIndex+=this.targetMoveSpeed

  }

  get x() {
    return this.position.x;
  }
  get y() {
    return this.position.y;
  }
  get z() {
    return this.position.z;
  }
}

export class Port {
  constructor(scene, x, y=1, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.paths = []; // TODO currently set by nav controller constructor, fix this
    this.ships = [];
    this.scene = scene;

    const geometry = new THREE.CylinderGeometry( 20, 20, 20, 32 );
    const material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
    const cylinder = new THREE.Mesh( geometry, material );
    cylinder.position.set(x, y, z)
    this.scene.add( cylinder );
  }

  get locationString() {
    return `${this.x},${this.y},${this.z}`;
  }

  createShip() {
    // don't do anything if the port has no paths
    if (this.paths.length == 0) return;

    // create ship with a random path
    const ship = new Ship(this.scene, this.x, this.y, this.z, this.paths[Math.floor(Math.random() * this.paths.length)]);
    console.log("created ship at port", this.locationString, "following path", ship.path.length, "nodes long");
    this.ships.push(ship);

    setTimeout(() => {
      this.createShip();
    }, Math.random() * 30000);
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