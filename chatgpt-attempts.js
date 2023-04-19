// This file is interesting. Just about all the code here was generated either by Github copilot or chatGPT - it doesn't all work, but I used it to get a feel for how to use the tools. I'm not sure if I'll keep this file, but it's interesting to see how much of the code was generated.

/**
 * given a 2d array of heights, generate a mesh
 * 
 * Contains some commented out code that was generated with copilot in a bunch of different attempts
 * @param {} terrainMap 
 */
generateTerrainMesh(terrainMap) {
  const geometry = new THREE.PlaneGeometry(terrainMap.length, terrainMap[0].length, terrainMap.length/4, terrainMap[0].length/4);
  const material = new THREE.MeshStandardMaterial({ vertexColors: true });
  // const material = new THREE.MeshLambertMaterial({ color: 0xdddddd });

  var vertices = geometry.attributes.position.array;
  const color = new THREE.Color();
  const colors = [];

  // for (let y=0; y<terrainMap.length; y++) {
  //   for (let x=0; x<terrainMap[0].length; x++) {
  //     vertices[(y * terrainMap.length + x) * 3 + 2] = terrainMap[y][x];
  //     const col = this.getColor(terrainMap[y][x]);
  //     color.setHex(col);
  //     colors.push(color.r, color.g, color.b);
  //   }
  // }

  // for (let i = 0; i < vertices.length; i++) {
  //   const x = vertices[i].x + geometry.parameters.width / 2;
  //   const y = vertices[i].y + geometry.parameters.height / 2;
  //   const z = terrainMap[y][x];
  //   vertices[i].z = z;
  // }
  // function lookUpPixelColor( terrainMap, ux, uy, width){
  //   var px = Math.floor( ux * width);
  //   var py = Math.floor( uy * width );
  //   var index = (uy * width + ux) * 4;
  //   if( index < 0 || index >= terrainMap.length ){
  //     return 0;
  //   }
  //   return {
  //     r: imageData.data[ index ] ,
  //   };
  // }

  // vertices.forEach((v) => {
  //   console.log(v.x, v.y);
  //   var ux = (v.x + geometry.parameters.width * 0.5) / geometry.parameters.width;
  //   var uy = (v.y + geometry.parameters.height * 0.5) / geometry.parameters.height;

  //   console.log("ux", ux, "uy", uy)
  //   var h = terrainMap[uy][ux];
  //   v.z = h;
  // })



  // geometry.vertices.forEach( function( v ){
  //   var ux = (v.x + planeWidth * 0.5) / planeWidth;
  //   var uy = (v.y + planeHeight * 0.5) / planeHeight;
  
  //   var rgb = lookUpPixelColor( imageData, ux, uv );
  //   var height = rgb[ 0 ] / 255;
  //   var z = height * maxHeight;
  
  //   v.z = z;
  // });
  

  // for(let i=0, j=2; i < terrainMap.length; i += 4, j += 3) {
  //   vertices[j] = terrainMap[i];
  // }

  // for (let i = 0; i < vertices.length; i += 3) {

  //   vertices[i + 2] = terrainMap[i * ]

  //     if (vertices[i + 2] < 0) {
  //         vertices[i + 2] = 0;
  //     }

  //     // color vertices based on height
  //     color.setHex(this.getColor(vertices[i+2]));
  //     // console.log("height", vertices[i+2], "color", color.r, color.g, color.b)
  //     colors.push(color.r, color.g, color.b);
  // }

  console.log("vertices", vertices.length)
  console.log("colors", colors.length)

  // ??
  
  while (colors.length < vertices.length) {
    color.setHex(0xff0000)
    colors.push(color.r, color.g, color.b)
  }
  
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

  const terrain = new THREE.Mesh(geometry, material);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.set(0, 0, 0);

  terrain.geometry.attributes.position.needsUpdate = true;
  terrain.geometry.computeVertexNormals();

  return terrain;
}

  // given a 2d heightmap, generate and return a mesh
  generateMeshFromHeightmapCoPilot(heightmap) {
    const geometry = new THREE.Geometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const width = heightmap.length;
    const height = heightmap[0].length;

    // generate vertices
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const height = heightmap[x][y];
        geometry.vertices.push(new THREE.Vector3(x, height, y));
      }
    }

    // generate faces
    for (let x = 0; x < width - 1; x++) {
      for (let y = 0; y < height - 1; y++) {
        const v1 = x + y * width;
        const v2 = (x + 1) + y * width;
        const v3 = x + (y + 1) * width;
        const v4 = (x + 1) + (y + 1) * width;

        // two triangles per square
        geometry.faces.push(new THREE.Face3(v1, v2, v3));
        geometry.faces.push(new THREE.Face3(v2, v4, v3));
      }
    }

    // set colors
    for (let i = 0; i < geometry.faces.length; i++) {
      const face = geometry.faces[i];
      const color = this.getColor(heightmap[face.a % width][Math.floor(face.a / width)]);
      face.color.setHex(color);
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return new THREE.Mesh(geometry, material);
  }

  // given a 2d heightmap, generate and return a mesh
  generateMeshFromHeightmapChatGPT(heightmap) {
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const width = heightmap.length;
    const height = heightmap[0].length;
  
    // generate vertices
    const vertices = new Float32Array(width * height * 3);
    let i = 0;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const height = heightmap[y][x];
        vertices[i++] = x;
        vertices[i++] = height;
        vertices[i++] = y;
      }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  
    // generate faces
    const indices = new Uint16Array((width - 1) * (height - 1) * 6);
    i = 0;
    for (let x = 0; x < width - 1; x++) {
      for (let y = 0; y < height - 1; y++) {
        const v1 = x + y * width;
        const v2 = (x + 1) + y * width;
        const v3 = x + (y + 1) * width;
        const v4 = (x + 1) + (y + 1) * width;
  
        // two triangles per square
        indices[i++] = v1;
        indices[i++] = v2;
        indices[i++] = v3;
        indices[i++] = v2;
        indices[i++] = v4;
        indices[i++] = v3;
      }
    }
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  
    // set colors
    const colors = new Float32Array(width * height * 3);
    i = 0;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const color = new THREE.Color();
        color.setHex(this.getColor(heightmap[x][y]));
        colors[i++] = color.r;
        colors[i++] = color.g;
        colors[i++] = color.b;
      }
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
    geometry.computeVertexNormals();
  
    return new THREE.Mesh(geometry, material);
  }