---
acceptance_criteria:
  - Opening index.html in a browser shows a 10×20 grid
  - Pressing arrow keys moves the active piece
  - Hard-drop locks the piece + animates
created_at: 2026-05-07T21:56:23.532Z
created_by: human
edges:
  composed_of:
    - id: build-and-deploy
  depends_on:
    - id: vite-setup
    - id: game-state-machine
    - id: keyboard-handler
id: main-entry
is_root: false
open_questions: []
owner: architect-agent
parent: build-and-deploy
private: false
risks: []
status: done
summary: "src/main.ts: createPlayfield → newGame → keyboard listeners → requestAnimationFrame loop with gravity ticks."
tags: []
title: "Main entry: wire game"
type: task
updated_at: 2026-05-08T06:39:44.791Z
---

# Main entry: wire game

src/main.ts: createPlayfield → newGame → keyboard listeners → requestAnimationFrame loop with gravity ticks.

Autobuild iter 16 (capstone) start: 2026-05-08T06:37:52Z

Implemented: src/main.ts (bootstrap, full game loop) + src/__tests__/main.test.ts (smoke 9/9); composes tick-driver + DAS/ARR + keyboard-handler + applyIntent + renderBoard + renderPiece + animateLockFlash + animateLineClear + HUD; bun run build → 14 KB bundle (5 KB gzip); bun run dev served entry verified; full suite 299/299 green
