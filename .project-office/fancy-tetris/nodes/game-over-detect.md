---
acceptance_criteria:
  - spawnNextPiece(state) returns either new state OR game-over state when spawn collides
  - Game-over state is sticky — applyIntent on a game-over state returns same state (except restart)
created_at: 2026-05-07T21:56:23.449Z
created_by: human
edges:
  composed_of:
    - id: progression-and-state
  depends_on:
    - id: game-state-machine
id: game-over-detect
is_root: false
open_questions: []
owner: architect-agent
parent: progression-and-state
private: false
risks: []
status: done
summary: When canPlacePiece returns false at spawn, the game flips to game-over. State sticks until restart.
tags: []
title: Game-over (spawn collision)
type: task
updated_at: 2026-05-07T22:34:57.821Z
---

# Game-over (spawn collision)

When canPlacePiece returns false at spawn, the game flips to game-over. State sticks until restart.

Autobuild iter 5 start: 2026-05-07T22:33:33Z

Implemented: spawnNextPiece exported from src/game-core/game-state.ts (extracted from lockAndAdvance); Tests: src/game-core/__tests__/game-over.test.ts (11/11 pass); game-over status sticky on all intents except restart; full suite 165/165 green
