#import "@preview/cetz:0.3.1": canvas, draw
#canvas({
  draw.circle((x: 0, y: 0), radius: 1, name: "c")
  draw.line("c.north", (x: 2, y: 2))
})
