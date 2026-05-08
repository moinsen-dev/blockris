---
acceptance_criteria:
  - GameState type covers all per-frame fields
  - newGame(seed?) returns a fresh state with running=true
  - applyIntent(state, intent, now) is pure
created_at: 2026-05-07T21:56:23.448Z
created_by: human
edges:
  blocks:
    - id: main-entry
    - id: score-tracker
    - id: game-over-detect
    - id: pause-and-restart
  composed_of:
    - id: progression-and-state
id: game-state-machine
is_root: false
open_questions: []
owner: architect-agent
parent: progression-and-state
private: false
risks: []
status: done
summary: "Top-level state: board + active piece + bag + score + level + lines + running/paused/game-over. Reducer-style updates."
tags: []
title: Game-state machine
type: task
updated_at: 2026-05-07T22:33:12.559Z
---

# Game-state machine

Top-level state: board + active piece + bag + score + level + lines + running/paused/game-over. Reducer-style updates.

Autobuild iter 4 start: 2026-05-07T22:31:25Z

Implemented: src/game-core/game-state.ts (newGame, applyIntent, GameState, Intent); Tests: 21/21 pass; pure-functional reducer, deterministic across seeds
