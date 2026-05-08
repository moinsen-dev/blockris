---
acceptance_criteria:
  - Active piece animates each gravity tick at 60fps
  - Line-clear plays a horizontal sweep before rows collapse
  - Hard-drop ends with a lock-flash on placed cells
created_at: 2026-05-07T21:20:10.885Z
created_by: human
edges:
  composed_of:
    - id: goal-root
  decided_by:
    - id: canvas-vs-dom-decision
  decomposes_into:
    - id: dom-playfield
    - id: cell-rendering
    - id: piece-renderer
    - id: motion-drop-animation
    - id: motion-line-clear-sweep
    - id: motion-hard-drop-flash
  mitigated_by:
    - id: risk-motion-vs-fps
id: render-and-motion
is_root: false
open_questions: []
owner: architect-agent
parent: goal-root
private: false
risks: []
status: draft
summary: DOM-based rendering driven by motion.dev — drop animations, lock-flash, line-clear sweep, rotation easing, hold-piece preview.
tags: []
title: Render + Motion (the 'fancy' part)
type: subproject
updated_at: 2026-05-07T21:56:23.613Z
---

# Render + Motion (the 'fancy' part)

DOM-based rendering driven by motion.dev — drop animations, lock-flash, line-clear sweep, rotation easing, hold-piece preview.
