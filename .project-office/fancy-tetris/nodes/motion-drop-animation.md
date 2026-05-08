---
acceptance_criteria:
  - animateDrop(piece-overlay-element) applies a transform interpolation
  - Animation duration matches the gravity-curve at the current level (capped at 120ms)
created_at: 2026-05-07T21:55:31.544Z
created_by: human
edges:
  composed_of:
    - id: render-and-motion
  depends_on:
    - id: piece-renderer
id: motion-drop-animation
is_root: false
open_questions: []
owner: architect-agent
parent: render-and-motion
private: false
risks: []
status: done
summary: When the active piece moves down by one row (gravity tick), the visual position interpolates with motion.dev (~120ms ease-out) instead of jumping. Uses CSS transform.
tags: []
title: Gravity-tick drop animation via motion.dev
type: task
updated_at: 2026-05-08T06:29:58.864Z
---

# Gravity-tick drop animation via motion.dev

When the active piece moves down by one row (gravity tick), the visual position interpolates with motion.dev (~120ms ease-out) instead of jumping. Uses CSS transform.

Autobuild iter 11 start: 2026-05-08T06:29:11Z

Implemented: src/render/drop-animation.ts (animateDrop, durationForLevel, MAX_DROP_DURATION_MS=120); Tests: 15/15 pass; capped at 120ms per spec; honours gravity-curve at higher levels
