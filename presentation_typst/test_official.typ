#import "@preview/cetz:0.3.1": canvas, draw
#canvas({
  import draw: *
  circle((0,0), radius: 1, name: "c")
  line("c.west", "c.east")
})
