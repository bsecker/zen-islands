import { Scene } from "three";
import { Port } from "./ships";

export function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * given a set of coordinates (x,y), return a normalised value between 0 and 1 of the distance to the center (0,0), where 1 is at the center and 0 is at the edge
 * @param {*} x 
 * @param {*} y 
 */
function islandise_round(x: number, y: number, width: number) {
  const dist = distance(width / 2, width / 2, x, y);
  const maxDist = width / 2;
  // if distance is larger than the max distance, scale it back to 0 quicker
  if (dist > maxDist) {
    return 5 / dist
  }

  // normalise
  return 1.00 - (dist / maxDist);
}

/**
 * given a set of coords (x,y), apply a square mask to the coords so that the edges are lower than the center
 */
// function islandise_square(x,y) {
//     const distance_x = Math.abs(-x);
//     const distance_y = Math.abs(-y);

//     const distance = Math.max(distance_x, distance_y);
//     const max_width = (WIDTH * 0.5);
//     const delta = distance / max_width;
//     const gradient = delta * delta;

//     return Math.max(0, 1.0-gradient);
// }



export function generateTerrain(noise: any, width: number, height: number, octaves = 5, persistence = 0.501, scale = 0.0008, low = -300, high = 300) {
  console.log("generating terrain...")

  // fill empty array
  const terrain = Array(height).fill([]).map(() => Array(width).fill(0));

  // run perlin.sumoctave for every x,y coordinate
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let point = noise.sum_octave(octaves, x, y, persistence, scale, low, high) // * islandise_round(x, y, width);
      // if (point < 0) {
      //   point = 0;
      // }
      terrain[y][x] = point;
    }
  }

  return terrain;
}

/**
 * I guess a better algorithm would be:
 * - run a convolution filter over the array, take the average of points, if close to 0 then add to list
 */

export function generatePorts(terrain: number[][], portNum: number, scene: Scene) {
  const ports = []
  console.log("generating ports...")

  const shoreCoords = [];

  for (let z = 1; z < terrain.length - 1; z++) {
    for (let x = 1; x < terrain[0].length - 1; x++) {

      // a point is on a shore if at least one of its neighbours is sand (>=1) and it is not sand itself
      if (terrain[z][x] < 0 && (terrain[z + 1][x] >=0  ||
        terrain[z - 1][x] >= 0 ||
        terrain[z][x + 1] >= 0 ||
        terrain[z][x - 1] >= 0)) {
        shoreCoords.push([x, z])
      }
    }
  }

  for (let i = 0; i < portNum; i++) {

    // pick a random coordinate from the list
    const coord = shoreCoords[Math.floor(Math.random() * shoreCoords.length)];

    // TODO remove picked from list

    ports.push(new Port(scene, coord[0], 0, coord[1]));
  }

  console.log(ports);

  return ports
}
