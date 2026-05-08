---
acceptance_criteria:
  - renderPiece(playfield, type, rotation, col, row) marks 4 cells as 'piece-overlay'
  - Calling renderPiece with a different position clears the previous overlay first
created_at: 2026-05-07T21:55:31.544Z
created_by: human
edges:
  blocks:
    - id: motion-drop-animation
    - id: motion-hard-drop-flash
  composed_of:
    - id: render-and-motion
  depends_on:
    - id: cell-rendering
id: piece-renderer
is_root: false
open_questions: []
owner: architect-agent
parent: render-and-motion
private: false
risks: []
status: done
summary: Paints the currently-falling piece as a separate visual layer (no commit to board until lock-down). Uses TetrominoSpec to compute the 4 cells and paints them with the piece's color.
tags: []
title: Active-piece renderer (overlay)
type: task
updated_at: 2026-05-08T06:26:54.437Z
---

# Active-piece renderer (overlay)

Paints the currently-falling piece as a separate visual layer (no commit to board until lock-down). Uses TetrominoSpec to compute the 4 cells and paints them with the piece's color.

Autobuild iter 10 start: 2026-05-08T06:26:08Z

Implemented: src/render/piece-renderer.ts (renderPiece, clearPieceOverlay); Tests: 12/12 pass; uses class='piece-overlay' + data-overlay-type + --piece-color CSS var; off-board cells skipped silently; underlying board state preserved
