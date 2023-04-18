# Terrain Generation

## TODO

- [ ] Add seed to noise generator
- [ ] improve islandiser so outsides aren't just sandbars.
  - Custom curve? start shallow (so can have lots of mountainous in middle), get steep at end?
  - Also need a way to make the island not look completely circularised
- [ ] make water 3d - don't set to 0, maybe translucent overlay?
- [ ] switch to typescript

## Resources

Terrain gen
- https://cmaher.github.io/posts/working-with-simplex-noise/
- https://en.wikipedia.org/wiki/Fractional_Brownian_motion
- https://gamedev.stackexchange.com/questions/54276/a-simple-method-to-create-island-map-mask
- https://medium.com/@travall/procedural-2d-island-generation-noise-functions-13976bddeaf9
- https://shanee.io/blog/2015/09/25/procedural-island-generation/
- 

Manual terrain testing

`node -r esm heightmap.js`

