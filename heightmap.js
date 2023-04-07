import { writeFileSync } from 'fs';
import { SimplexNoise } from './noise.js';
const sharp = require('sharp');

// Define the size of the heightmap
const width = 2000;
const height = 2000;

const perlin = new SimplexNoise();

// fun: f=0.01, a=10, o=1 makes some cool abstract art :)

const frequency = 0.005;
const amplitude = 1;
const octaves = 4;

// Generate the heightmap
const heightmap = [];
for (let y = 0; y < height; y++) {
  const row = [];
  for (let x = 0; x < width; x++) {
    // Calculate the noise value for this point
    // const noiseValue = perlin.noise(x / smoothing, y / smoothing);
    const noiseValue = perlin.simplex_noise(x, y, frequency, amplitude, octaves);
    // Map the noise value to a height value between 0 and 255
    let heightValue = Math.floor((noiseValue + 1) * 127.5);
    // limit noise between 0 and 255

    // console.log("noise", noiseValue, "height", heightValue)
    // Add the height value to the row
    row.push(heightValue);
  }
  // Add the row to the heightmap
  heightmap.push(row);
}

/**
 * convert the heightmap to a png using the sharp library 
 */ 
function save_heightmap(heightmap, width, height) {
  const buffer = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y++) {
      const row = heightmap[y];
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        let heightValue = row[x];
        heightValue = Math.min(Math.max(heightValue, 0), 255);
        buffer[i] = heightValue;
        buffer[i + 1] = heightValue;
        buffer[i + 2] = heightValue;
        buffer[i + 3] = 255;
      }
    }
    sharp(buffer, {
      raw: {
        width: width,
        height: height,
        channels: 4
      }
    })
      .png()
      .toFile('heightmap.png');
}

save_heightmap(heightmap, width, height);