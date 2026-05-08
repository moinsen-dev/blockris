---
acceptance_criteria:
  - No animation animates a layout-triggering property
  - Lint or code-review checklist enforces the rule
created_at: 2026-05-07T22:18:52.573Z
created_by: human
edges:
  composed_of:
    - id: risk-motion-vs-fps
id: gpu-only-animations
is_root: false
open_questions: []
owner: null
parent: risk-motion-vs-fps
private: false
risks: []
status: ready
summary: All motion.dev animations are restricted to transform and opacity. Layout-triggering properties (top/left/width/height/margin) are forbidden.
tags: []
title: motion.dev tweens use GPU-composited properties only
type: constraint
updated_at: 2026-05-07T22:21:02.653Z
---

# motion.dev tweens use GPU-composited properties only

All motion.dev animations are restricted to transform and opacity. Layout-triggering properties (top/left/width/height/margin) are forbidden.
