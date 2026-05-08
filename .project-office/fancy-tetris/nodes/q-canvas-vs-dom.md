---
acceptance_criteria: []
created_at: 2026-05-07T21:20:10.885Z
created_by: human
edges:
  composed_of:
    - id: goal-root
  decided_by:
    - id: canvas-vs-dom-decision
  derived_from:
    - id: goal-root
expected_resolution_path: Decide via /project-office:decide once render-and-motion is decomposed
id: q-canvas-vs-dom
is_root: false
open_questions: []
owner: null
parent: goal-root
private: false
risks: []
status: done
summary: "Canvas is Tetris-conventional (cheap pixel-perfect); DOM lets motion.dev choreograph each cell. Tradeoff: rendering cost vs animation ergonomics."
tags: []
target_role: architect
title: Canvas-2D vs DOM-with-CSS-transforms for the playfield?
type: open-question
updated_at: 2026-05-07T21:54:19.970Z
---

# Canvas-2D vs DOM-with-CSS-transforms for the playfield?

Canvas is Tetris-conventional (cheap pixel-perfect); DOM lets motion.dev choreograph each cell. Tradeoff: rendering cost vs animation ergonomics.

Resolved by decision canvas-vs-dom-decision: DOM + motion.dev.
