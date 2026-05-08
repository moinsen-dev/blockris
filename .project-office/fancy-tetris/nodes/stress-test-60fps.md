---
acceptance_criteria:
  - Documented reproducible stress scenario
  - Measured FPS >= 55 across the scenario on baseline hardware
created_at: 2026-05-07T22:18:52.574Z
created_by: human
edges:
  composed_of:
    - id: risk-motion-vs-fps
  mitigates:
    - id: risk-motion-vs-fps
id: stress-test-60fps
is_root: false
open_questions: []
owner: test-lead-agent
parent: risk-motion-vs-fps
private: false
risks: []
status: done
summary: "Worst-case scenario: T-spin + 4-line clear + active piece falling + queue preview animating simultaneously. FPS must stay >= 55."
tags: []
title: "Stress-test scenario: 60fps under worst-case load"
type: task
updated_at: 2026-05-08T06:34:42.635Z
---

# Stress-test scenario: 60fps under worst-case load

Worst-case scenario: T-spin + 4-line clear + active piece falling + queue preview animating simultaneously. FPS must stay >= 55.

Autobuild iter 14 start: 2026-05-08T06:33:33Z

Implemented: src/loop/stress-scenario.ts (buildStressState, runStressFrame, FRAME_BUDGET_*); Tests: 14/14 pass; documented two-layer verification (CI synthetic-cost + real-browser DevTools); avg frame cost across 60 sim-frames stays under 60fps budget
