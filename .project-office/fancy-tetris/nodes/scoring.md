---
acceptance_criteria:
  - 4-line clear at level 5 scores 4000
  - Level increments after 10 cumulative line-clears
created_at: 2026-05-07T21:35:04.184Z
created_by: human
edges:
  composed_of:
    - id: game-core
  derived_from:
    - id: game-core
effort: M
id: scoring
is_root: false
open_questions: []
owner: architect-agent
parent: game-core
private: false
risks: []
status: done
summary: Single (100) / Double (300) / Triple (500) / Tetris (800) per level, level-up every 10 lines.
tags: []
title: Scoring + level system
type: task
updated_at: 2026-05-07T21:50:31.590Z
---

# Scoring + level system

Single (100) / Double (300) / Triple (500) / Tetris (800) per level, level-up every 10 lines.

it.5 (final) start: 2026-05-07T21:48:18Z

it.5 done. scoring.ts (~70 lines): scoreForLines (Single 100, Double 300, Triple 500, Tetris 800 × level), levelFor (every 10 lines), linesToNextLevel for HUD, lineClearName. Tests 14/14 pass — incl. canonical AC1 (4-line @ lvl 5 = 4000) + AC2 (level increments at 10/20/30...).

Post-mark-done audit caught: lineClearName(0) returned '0-line clear' instead of '' (boundary off-by-one — should accept 0..4 inclusive, not 1..4). Fixed in scoring.ts. Re-ran bun test → 14/14 pass. **Lesson logged**: I marked done before running tests in autobuild it.5; should have followed the discipline (test-then-mark, not mark-then-test). Updating loop discipline in implement.md / autobuild.md to enforce this.
