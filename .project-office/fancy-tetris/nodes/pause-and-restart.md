---
acceptance_criteria:
  - togglePause(state) flips paused ↔ running, idempotent on game-over
  - restart(state) returns a fresh game-state with seeded bag
created_at: 2026-05-07T21:56:23.366Z
created_by: human
edges:
  composed_of:
    - id: input-controls
  depends_on:
    - id: game-state-machine
id: pause-and-restart
is_root: false
open_questions: []
owner: architect-agent
parent: input-controls
private: false
risks: []
status: done
summary: togglePause flips paused↔running. restart resets the board+bag+score; only when paused or game-over.
tags: []
title: Pause / Resume / Restart
type: task
updated_at: 2026-05-08T06:25:38.036Z
---

# Pause / Resume / Restart

togglePause flips paused↔running. restart resets the board+bag+score; only when paused or game-over.

Autobuild iter 9 start: 2026-05-08T06:24:33Z

Implemented: togglePause + restart helpers in src/game-core/game-state.ts; Tests: 12/12 pass; togglePause idempotent on game-over (returns same ref); restart preserves startLevel + diverges seed by default; full suite 227/227
