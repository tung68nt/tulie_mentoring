#import "@preview/cetz:0.2.2": canvas, draw
#canvas({
  import draw: *
  rect((x: 0, y: 0), (x: 1, y: 1), name: "r")
  line("r.top", (x: 2, y: 2))
})
