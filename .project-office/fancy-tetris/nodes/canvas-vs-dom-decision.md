---
acceptance_criteria: []
created_at: 2026-05-07T21:54:19.894Z
created_by: human
edges:
  decision_affects:
    - id: render-and-motion
    - id: q-canvas-vs-dom
id: canvas-vs-dom-decision
is_root: false
open_questions: []
owner: null
private: false
risks: []
status: done
summary: DOM + motion.dev (not Canvas-2D)
tags: []
title: DOM + motion.dev (not Canvas-2D)
type: decision
updated_at: 2026-05-07T21:54:19.894Z
---

Project goal explicitly names motion.dev. DOM-with-CSS-transforms gives motion.dev the per-cell elements it needs to choreograph drop/lock-flash/line-clear-sweep animations. Canvas-2D would be lighter on rendering cost but reduce motion.dev to manual canvas redraws — defeats the 'fancy' goal. We accept the per-cell DOM-element overhead (200 cells max) for the animation ergonomics.