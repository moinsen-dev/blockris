---
acceptance_criteria: []
created_at: 2026-05-07T21:20:10.885Z
created_by: human
edges:
  composed_of:
    - id: goal-root
  decomposes_into:
    - id: frame-budget-profiler
    - id: gpu-only-animations
    - id: decouple-tick-from-tween
    - id: line-clear-blocks-or-concurrent
    - id: frame-overflow-fallback
    - id: stress-test-60fps
  mitigated_by:
    - id: frame-budget-profiler
    - id: decouple-tick-from-tween
    - id: frame-overflow-fallback
    - id: stress-test-60fps
  mitigates:
    - id: render-and-motion
id: risk-motion-vs-fps
impact: high
is_root: false
open_questions: []
owner: risk-officer-agent
parent: goal-root
private: false
probability: medium
risks: []
status: draft
summary: Tetris needs deterministic 60fps rule-step + render. Heavy motion.dev animations can drop frames if mismanaged.
tags: []
title: motion.dev animation budget might fight 60fps gameplay
type: risk
updated_at: 2026-05-07T21:50:31.665Z
---

# motion.dev animation budget might fight 60fps gameplay

Tetris needs deterministic 60fps rule-step + render. Heavy motion.dev animations can drop frames if mismanaged.
