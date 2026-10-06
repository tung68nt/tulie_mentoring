// ══════════════════════════════════════════════
// TULIE MENTORING ECOSYSTEM - PITCH DECK & USER GUIDE
// Typst Version - Designed by Tulie Tech
// ══════════════════════════════════════════════

// ── Color Palette ──
#let pblue = rgb("#0d47a1")
#let pcyan = rgb("#00bcd4")
#let pgray = rgb("#616161")
#let plight = rgb("#e3f2fd")

// ── Page Setup ──
#set page(
  paper: "a4",
  margin: (top: 3cm, bottom: 2.5cm, left: 2.5cm, right: 2.5cm),
  header: context {
    if counter(page).get().first() > 1 [
      #set text(8pt, fill: pgray, style: "italic")
      #h(1fr) Pitch Deck & User Guide — Tulie Mentoring Ecosystem
      #line(length: 100%, stroke: 0.3pt + pgray)
    ]
  },
  footer: context {
    let num = counter(page).get().first()
    if num > 1 [
      #line(length: 100%, stroke: 0.3pt + pgray)
      #v(4pt)
      #set text(9pt, fill: pgray)
      Công ty TNHH DV & GPCC Tulie #h(1fr) Trang #num
    ]
  },
)

// ── Typography ──
#set text(
  font: ("Times New Roman", "Palatino"),
  size: 12pt,
  lang: "vi",
)

#set par(
  justify: true,
  leading: 0.85em,
  first-line-indent: 1.2em,
)

// ── Headings ──
#show heading.where(level: 1): it => {
  pagebreak(weak: true)
  v(1cm)
  block(width: 100%)[
    #set text(18pt, weight: "bold", fill: pblue)
    #it.body
    #v(4pt)
    #line(length: 100%, stroke: 2pt + pblue)
  ]
  v(0.8cm)
}

#show heading.where(level: 2): it => {
  v(0.6cm)
  block[
    #set text(14pt, weight: "bold", fill: pblue.lighten(15%))
    #it.body
  ]
  v(0.3cm)
}

#show heading.where(level: 3): it => {
  v(0.4cm)
  block[
    #set text(12pt, weight: "bold", fill: pgray.darken(20%))
    #it.body
  ]
  v(0.2cm)
}

// ── Table styling ──
#set table(
  stroke: 0.5pt + pgray.lighten(40%),
  inset: 8pt,
)

// ── Figure caption styling ──
#show figure.caption: it => {
  set text(10pt, style: "italic")
  it
}

// ── Custom function: source caption ──
#let captionsource(src) = {
  set text(9pt, fill: pgray, style: "italic")
  align(center)[Nguồn: #src]
}

// ── Custom function: colored table header ──
#let thead(..cells) = {
  table.cell(fill: pblue, text(fill: white, weight: "bold", cells.pos().join()))
}

// ══════════════════════════════════════════════
// TITLE PAGE
// ══════════════════════════════════════════════
#align(center + horizon)[
  #v(-2cm)
  #block(
    width: 85%,
    inset: 30pt,
    radius: 12pt,
    stroke: 2pt + pblue,
    fill: plight,
  )[
    #set text(13pt, fill: pgray)
    CHƯƠNG TRÌNH IMP (ISME MENTORING PROGRAM)
    #v(1cm)
    #set text(22pt, weight: "bold", fill: pblue)
    PITCH DECK & USER GUIDE
    #v(0.3cm)
    #set text(15pt, fill: pblue.lighten(20%))
    HỆ SINH THÁI MENTORING IMP
    #v(0.4cm)
    #line(length: 60%, stroke: 1pt + pcyan)
    #v(0.4cm)
    #set text(12pt, fill: pgray)
    Giải pháp quản trị rèn luyện kỷ luật và hiệu suất
    #v(1.5cm)
    #set text(11pt, fill: pgray)
    Đơn vị phát triển:
    #v(0.2cm)
    #set text(14pt, weight: "bold", fill: pblue)
    CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP \ CÔNG NGHỆ TULIE
    #v(1.5cm)
    #set text(11pt, fill: pgray)
    Hà Nội — 2026
  ]
]

#pagebreak()

// ── TABLE OF CONTENTS ──
#align(center)[
  #text(18pt, weight: "bold", fill: pblue)[MỤC LỤC]
  #v(4pt)
  #line(length: 40%, stroke: 2pt + pblue)
]
#v(0.5cm)
#outline(depth: 3, indent: 1.5em)

// ── CHAPTERS ──
#include "chapters/tomtat.typ"
#include "chapters/ch1_lydo.typ"
#include "chapters/ch2_cosolyluan.typ"
#include "chapters/ch3_phanhe.typ"
#include "chapters/ch4_uuviet.typ"
#include "chapters/ch6_ai_mentor.typ"
#include "chapters/ch5_ketluan.typ"
#include "chapters/phuluc.typ"

#pagebreak()

// ── BIBLIOGRAPHY ──
#bibliography("references.bib", style: "apa")
