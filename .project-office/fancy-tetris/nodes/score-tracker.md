---
acceptance_criteria:
  - After a 4-line clear at level 1, state.score increases by 800
  - After 10 cumulative lines, state.level increments by 1
  - linesToNextLevel is exposed for HUD
created_at: 2026-05-07T21:56:23.449Z
created_by: human
edges:
  composed_of:
    - id: progression-and-state
  depends_on:
    - id: game-state-machine
id: score-tracker
is_root: false
open_questions: []
owner: architect-agent
parent: progression-and-state
private: false
risks: []
status: done
summary: Wires line-clear into scoreForLines + levelFor. Updates state.score / state.level / state.linesCleared.
tags: []
title: Score + level tracker
type: task
updated_at: 2026-05-08T06:33:01.049Z
---

# Score + level tracker

Wires line-clear into scoreForLines + levelFor. Updates state.score / state.level / state.linesCleared.

Autobuild iter 13 start: 2026-05-08T06:32:09Z

Implemented: linesToNextLevel HUD helper exported from src/game-core/game-state.ts; line-clear scoring already wired in lockAndAdvance; Tests: 12/12 pass; verified 4-line clear @ lvl1 = 800, level increments at 10 cumulative lines
