#import "@preview/cetz:0.2.2": canvas, draw
#canvas({
  import draw: *
  rect((0,0), (1,1), name: "r")
  line("r.north", (2,2))
})
