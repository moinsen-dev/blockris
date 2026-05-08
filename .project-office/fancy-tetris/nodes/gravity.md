---
acceptance_criteria:
  - hardDrop returns the lock-position for any piece+board
  - Gravity follows the official curve (level → frames-per-cell)
created_at: 2026-05-07T21:35:04.184Z
created_by: human
edges:
  composed_of:
    - id: game-core
  derived_from:
    - id: game-core
effort: M
id: gravity
is_root: false
open_questions: []
owner: architect-agent
parent: game-core
private: false
risks: []
status: done
summary: Soft-drop (1 cell per tick), hard-drop (instant), gravity-curve per level.
tags: []
title: Gravity tick + drop logic
type: task
updated_at: 2026-05-07T21:50:31.436Z
---

# Gravity tick + drop logic

Soft-drop (1 cell per tick), hard-drop (instant), gravity-curve per level.

it.3 start: 2026-05-07T21:46:25Z

it.3 done. gravity.ts (~85 lines): GRAVITY_TABLE per Tetris guideline (level 0=48f/cell → level 29+=1f/cell), framesPerCell, msPerCell, canMove, softDropOne, hardDrop, dropDistance. Tests 17/17 pass.
