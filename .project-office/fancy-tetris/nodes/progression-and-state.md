---
acceptance_criteria:
  - Level increments every 10 line-clears; gravity follows the official curve
  - Game-over fires when a spawning piece can't fit; restart works from any state
created_at: 2026-05-07T21:20:10.885Z
created_by: human
edges:
  composed_of:
    - id: goal-root
  decomposes_into:
    - id: game-state-machine
    - id: score-tracker
    - id: game-over-detect
id: progression-and-state
is_root: false
open_questions: []
owner: architect-agent
parent: goal-root
private: false
risks: []
status: draft
summary: Level system, gravity speed-up curve, score (singles/doubles/triples/tetris/T-spin), pause / restart / game-over screens.
tags: []
title: Progression + Game State
type: subproject
updated_at: 2026-05-07T21:56:23.795Z
---

# Progression + Game State

Level system, gravity speed-up curve, score (singles/doubles/triples/tetris/T-spin), pause / restart / game-over screens.
