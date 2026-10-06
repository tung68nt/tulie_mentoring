#import "@preview/cetz:0.3.1": canvas, draw
#canvas(length: 1cm, {
  draw.rect((0, 0), (1, 1), name: "r")
  draw.line("r.north", (2, 2))
})
