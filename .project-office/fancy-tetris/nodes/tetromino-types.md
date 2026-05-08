---
acceptance_criteria:
  - All 7 tetrominoes have correct shape per rotation (matches Tetris guideline)
  - Kick-tables exist for both J/L/S/T/Z (common) and I (special)
created_at: 2026-05-07T21:35:04.183Z
created_by: human
edges:
  composed_of:
    - id: game-core
  derived_from:
    - id: game-core
effort: M
id: tetromino-types
is_root: false
open_questions: []
owner: architect-agent
parent: game-core
private: false
risks: []
status: done
summary: TS types for the 7 tetrominoes (I, O, T, S, Z, J, L) with all 4 rotation states + SRS kick tables.
tags: []
title: Tetromino types + SRS rotation tables
type: task
updated_at: 2026-05-07T21:50:31.213Z
---

# Tetromino types + SRS rotation tables

TS types for the 7 tetrominoes (I, O, T, S, Z, J, L) with all 4 rotation states + SRS kick tables.

Implementation started: 2026-05-07T21:35:17Z. Code-root: /tmp/po-tetris/src/

Implemented at 2026-05-07T21:36:59Z.

Files:
- src/game-core/tetromino-types.ts (~330 lines): 7 TetrominoSpecs (I/O/T/S/Z/J/L) with all 4 rotation states verified against Tetris guideline; SRS kick tables for both JLSTZ + I groups; helpers (shapeOf, rotateBy, transitionKey, getKickTable).

Tests: 15/15 pass (bun test):
- 7 standard pieces present, 4 rotations × 4 cells each
- O-piece identical across rotations
- T-piece spot-check at rotations 0 + 2
- All offsets in 4×4 bbox
- rotateBy +/-1 cycles correctly
- transitionKey covers 8 SRS transitions, returns null for 180°
- Kick tables complete (8×4 per group), I and JLSTZ differ
