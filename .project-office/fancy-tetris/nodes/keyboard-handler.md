---
acceptance_criteria:
  - handleKey(event, state) returns a typed Intent (move-left | move-right | soft-drop | hard-drop | rotate-cw | rotate-ccw | hold | pause | restart | none)
  - All bindings are configurable via a KEY_BINDINGS constant
created_at: 2026-05-07T21:56:23.365Z
created_by: human
edges:
  blocks:
    - id: main-entry
    - id: das-arr
  composed_of:
    - id: input-controls
id: keyboard-handler
is_root: false
open_questions: []
owner: architect-agent
parent: input-controls
private: false
risks: []
status: done
summary: Binds standard Tetris keys → typed Intents. Arrows / Space (hard-drop) / X-Z (rotate) / C (hold) / P (pause).
tags: []
title: Keyboard input handler
type: task
updated_at: 2026-05-08T06:21:03.373Z
---

# Keyboard input handler

Binds standard Tetris keys → typed Intents. Arrows / Space (hard-drop) / X-Z (rotate) / C (hold) / P (pause).

Autobuild iter 6 start: 2026-05-08T06:20:22Z

Implemented: src/input/keyboard-handler.ts (KEY_BINDINGS, actionFromEvent, intentFromAction, handleKey); Tests: 23/23 pass; suppresses gameplay during paused/game-over; only restart escapes game-over
