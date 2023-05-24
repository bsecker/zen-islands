import { Scene } from "three";
import { Port } from "./ships";

export function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * given a set of coords (x,y), apply a square mask to the coords so that the edges are lower than the center
 */
function islandiseSquare(x: number,y: number, mapWidth: number, low: number, high: number) {
    const max_width = (mapWidth * 0.5);

    const distance_x = Math.abs(max_width-x);
    const distance_y = Math.abs(max_width-y);

    const distance = Math.max(distance_x, distance_y);

    const range = high - low;
    const rangeValue = range * (distance / (mapWidth));

    // Return the range value plus the minimum value
    let val = low + rangeValue;

    return val;

    // unfinished attempt to make edges drop off daster
    // return distance > (mapWidth-100) ? val-100: val

    // const delta = distance / max_width;
    // const gradient = delta * delta;

    // return Math.max(low,1-gradient);
}

/**
 * given a set of coords (x,y), apply a round mask to the coords so that the edges are lower than the center
 */
function islandiseRound(x: number,y: number, mapWidth: number, low: number, high: number) {
    const max_width = (mapWidth * 0.5);

    const distance_x = Math.abs(max_width-x);
    const distance_y = Math.abs(max_width-y);

    const distance = Math.sqrt(Math.pow(distance_x,2) + Math.pow(distance_y,2));

    const range = high - low;
    const rangeValue = range * (distance / (mapWidth));

    // Return the range value plus the minimum value
    let val = low + rangeValue;

    return val;

    // unfinished attempt to make edges drop off daster
    // return distance > (mapWidth-100) ? val-100: val

    // const delta = distance / max_width;
    // const gradient = delta * delta;

    // return Math.max(low,1-gradient);
}

export function generateTerrain(noise: any, width: number, height: number, octaves = 6, persistence = 0.501, scale = 0.0008, low = -150, high = 250) {
// export function generateTerrain(noise: any, width: number, height: number, octaves = 6, persistence = 0.45, scale = 0.0010, low = -150, high = 250) {
  console.log("generating terrain...")

  // fill empty array
  const terrain = Array(height).fill([]).map(() => Array(width).fill(0));

  // run perlin.sumoctave for every x,y coordinate
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let point = noise.sum_octave(octaves, x, y, persistence, scale, low, high) - islandiseRound(x, y, width, 0, 300);
      // round out edges
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
