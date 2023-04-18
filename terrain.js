export function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * given a set of coordinates (x,y), return a normalised value between 0 and 1 of the distance to the center (0,0), where 1 is at the center and 0 is at the edge
 * @param {*} x 
 * @param {*} y 
 */
function islandise_round(x, y, width) {
    const dist = distance(width/2, width/2, x, y);
    const maxDist = width / 2;
    // if distance is larger than the max distance, scale it back to 0 quicker
    if (dist > maxDist) {
        return 5/dist
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



export function generateTerrain(noise, width, height, octaves=7, persistence=0.501, scale=0.0008, low=-300, high=300) {
    console.log("generating terrain...")

    // fill empty array
    const terrain = Array(height).fill().map(() => Array(width).fill(0));

    // run perlin.sumoctave for every x,y coordinate
    for (let y=0; y<height; y++) {
      for (let x=0; x<width; x++) {
        let point = noise.sum_octave(octaves, x, y, persistence, scale, low, high) //* islandise_round(x,y, width);
        if (point < 0) {
          point = 0;
        }
        terrain[y][x] = point;
      }
    }

    return terrain;
}

/**
 * I guess a better algorithm would be:
 * - run a convolution filter over the array, take the average of points, if close to 0 then add to list
 */

function generate_ports(terrain) {
    console.log("generating ports...")

    const vertices = terrain.geometry.attributes.position.array;

    // generate a list of coordinates where y = 1
    const shore_coords = [];
    for (let i=0; i<=vertices.length; i+=3) {
        if (vertices[i+2] > 1 && vertices[i+2] < 2) {
            shore_coords.push([vertices[i], vertices[i+1], vertices[i+2]]);
        }
    }

    console.log(shore_coords.length)

    for (let i=0; i<30; i++) {

        // pick a random coordinate from the list
        const coord = shore_coords[Math.floor(Math.random() * shore_coords.length)];
        console.log("found", coord);

        // TODO remove picked from list

        const port = new Port(scene, coord[0], coord[2], -coord[1]);
        ports.push(port);
    }
}

function generate_node_graph() {
    console.log("calculating pathfinding graph...")

    const water_verticies = terrain.geometry.attributes.position.array;
    const water_points = [];

    for (let i=0; i < water_verticies.length; i+=3) {
        if (water_verticies[i+2] <= 0) {
            water_points.push([water_verticies[i], water_verticies[i+1], water_verticies[i+2]]);
        }
    }

    console.log("water points", water_points.length)
    return water_points;
}

/**
 * Iterate through all faces in the mesh, and if the face has all y coords equal to 0, add to list
 */
function get_water_faces(terrain) {
    const faces = terrain.geometry.attributes.position.array;
    console.log(faces.slice(0, 30));
}
