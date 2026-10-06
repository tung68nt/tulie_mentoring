#import "@preview/cetz:0.3.1": canvas, draw
#canvas({
  draw.rect((x: 0, y: 0), (x: 1, y: 1), name: "r")
  draw.line("r.north", (x: 2, y: 2))
})
