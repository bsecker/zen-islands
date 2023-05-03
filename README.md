# Terrain Generation

## TODO

- [ ] Add seed to noise generator
- [ ] improve islandiser so outsides aren't just sandbars.
  - Custom curve? start shallow (so can have lots of mountainous in middle), get steep at end?
  - Also need a way to make the island not look completely circularised
- [x] make water 3d - don't set to 0, maybe translucent overlay?
- [ ] switch to typescript
- [ ] change colour palette
- [x] make noise less chaotic - less octaves?
- [ ] use perlin noise to add subtle biomes
- [x] change boats to triangles
- [ ] run each ship in it's own thread, or do pathfinding in seperate thread?
- [ ] fix x/y getting screwed up - only notice when map is not square
- [ ] add interactive buttons to regenerate (and do on timer), stop movement, create ships etc
- [ ] Make outside look pretty
- [ ] host on website

## Resources

Terrain gen
- https://cmaher.github.io/posts/working-with-simplex-noise/
- https://en.wikipedia.org/wiki/Fractional_Brownian_motion
- https://gamedev.stackexchange.com/questions/54276/a-simple-method-to-create-island-map-mask
- https://medium.com/@travall/procedural-2d-island-generation-noise-functions-13976bddeaf9
- https://shanee.io/blog/2015/09/25/procedural-island-generation/
- 


## Running

`npx vite`

Manual terrain testing

`node -r esm heightmap.js`

