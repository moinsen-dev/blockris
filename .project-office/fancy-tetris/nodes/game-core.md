---
acceptance_criteria:
  - All 7 tetrominoes spawn with SRS-correct rotation states
  - Line-clear handles 1/2/3/4-line clears with correct score
  - Bag randomizer returns each piece exactly once per 7-bag
created_at: 2026-05-07T21:20:10.884Z
created_by: human
edges:
  composed_of:
    - id: goal-root
  decomposes_into:
    - id: tetromino-types
    - id: board
    - id: bag-randomizer
    - id: line-clear
    - id: scoring
    - id: gravity
id: game-core
is_root: false
open_questions: []
owner: architect-agent
parent: goal-root
private: false
risks: []
status: ready
summary: "Pure-functional Tetris rules: board, tetromino set, SRS rotation, gravity, line-clear, scoring. No DOM, fully testable."
tags: []
title: Game Core (rules engine)
type: subproject
updated_at: 2026-05-07T22:11:22.309Z
---

# Game Core (rules engine)

Pure-functional Tetris rules: board, tetromino set, SRS rotation, gravity, line-clear, scoring. No DOM, fully testable.
