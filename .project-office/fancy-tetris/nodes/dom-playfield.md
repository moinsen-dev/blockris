---
acceptance_criteria:
  - "createPlayfield(parentEl) returns a {root, cells: Array(200)} with cell elements addressable by getCell(col, row)"
  - Each cell has data-col and data-row attributes
  - Total root node count under playfield is exactly 200 cells + 1 root
created_at: 2026-05-07T21:55:31.543Z
created_by: human
edges:
  blocks:
    - id: cell-rendering
  composed_of:
    - id: render-and-motion
  derived_from:
    - id: render-and-motion
effort: M
id: dom-playfield
is_root: false
open_questions: []
owner: architect-agent
parent: render-and-motion
private: false
risks: []
status: done
summary: Renders the 10×20 playfield as nested divs (one root, 200 cell children) sized via CSS grid. Pure structure, no piece-rendering yet.
tags: []
title: DOM playfield (CSS grid 10×20)
type: task
updated_at: 2026-05-07T22:21:31.898Z
---

# DOM playfield (CSS grid 10×20)

Renders the 10×20 playfield as nested divs (one root, 200 cell children) sized via CSS grid. Pure structure, no piece-rendering yet.

Autobuild iter.6 start

iter.6 done. dom-playfield.ts (~70 lines): createPlayfield(parent, {cellPx?}) builds 1 root + 200 cells, CSS grid, data-col/data-row attributes, getCell(c, r) lookup. happy-dom test env. 9/9 tests pass.
