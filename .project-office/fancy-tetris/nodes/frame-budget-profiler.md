---
acceptance_criteria:
  - Logs rule-step and render duration per frame
  - Produces a 60s-session summary (avg / p95 / max)
  - Toggle-able via dev flag, off in production build
created_at: 2026-05-07T22:18:52.569Z
created_by: human
edges:
  composed_of:
    - id: risk-motion-vs-fps
  mitigates:
    - id: risk-motion-vs-fps
id: frame-budget-profiler
is_root: false
open_questions: []
owner: test-lead-agent
parent: risk-motion-vs-fps
private: false
risks: []
status: done
summary: Per-frame performance.now() logger captures rule-step ms + render ms across a 60s gameplay session; outputs a console/CSV summary.
tags: []
title: Frame-budget profiling harness
type: task
updated_at: 2026-05-07T22:29:19.220Z
---

# Frame-budget profiling harness

Per-frame performance.now() logger captures rule-step ms + render ms across a 60s gameplay session; outputs a console/CSV summary.

Autobuild iter 2 start: 2026-05-07T22:28:28Z

Implemented: src/loop/frame-budget-profiler.ts; Tests: 10/10 pass; toggle via createFrameBudgetProfiler({enabled})
