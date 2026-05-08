---
acceptance_criteria:
  - animateLockFlash(playfield, cells) returns a Promise that resolves after the flash
  - Cells end at their normal fill color, not white
created_at: 2026-05-07T21:55:31.544Z
created_by: human
edges:
  composed_of:
    - id: render-and-motion
  depends_on:
    - id: piece-renderer
id: motion-hard-drop-flash
is_root: false
open_questions: []
owner: architect-agent
parent: render-and-motion
private: false
risks: []
status: done
summary: On hard-drop, the 4 cells that lock-down play a brief white flash (200ms ease-out) before settling into their fill color. Confirms the player's commit visually.
tags: []
title: Hard-drop lock-flash via motion.dev
type: task
updated_at: 2026-05-08T06:31:05.123Z
---

# Hard-drop lock-flash via motion.dev

On hard-drop, the 4 cells that lock-down play a brief white flash (200ms ease-out) before settling into their fill color. Confirms the player's commit visually.

Autobuild iter 12 start: 2026-05-08T06:30:24Z

Implemented: src/render/lock-flash.ts (animateLockFlash, DEFAULT_LOCK_FLASH_DURATION_MS=200); Tests: 10/10 pass; cells return to normal fill colour post-flash; off-board cells skipped
