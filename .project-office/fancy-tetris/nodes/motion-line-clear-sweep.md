---
acceptance_criteria:
  - animateLineClear(playfield, rowIndices) returns a Promise that resolves after the sweep completes
  - Sweep duration is ~250ms regardless of row-count
created_at: 2026-05-07T21:55:31.544Z
created_by: human
edges:
  composed_of:
    - id: render-and-motion
  decided_by:
    - id: line-clear-blocking-decision
  depends_on:
    - id: cell-rendering
id: motion-line-clear-sweep
is_root: false
open_questions: []
owner: architect-agent
parent: render-and-motion
private: false
risks: []
status: done
summary: Before clearAndCollapse runs, the cleared rows play a horizontal sweep (left-to-right white flash) so the player sees what's clearing. Then collapse + render the new board.
tags: []
title: Line-clear sweep animation via motion.dev
type: task
updated_at: 2026-05-08T06:24:03.622Z
---

# Line-clear sweep animation via motion.dev

Before clearAndCollapse runs, the cleared rows play a horizontal sweep (left-to-right white flash) so the player sees what's clearing. Then collapse + render the new board.

Autobuild iter 8 start: 2026-05-08T06:23:16Z

Implemented: src/render/line-clear-sweep.ts (animateLineClear, DEFAULT_SWEEP_DURATION_MS=250, pluggable scheduler); Tests: 12/12 pass; sweep blocks per line-clear-blocking-decision; duration independent of row count
