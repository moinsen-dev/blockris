---
acceptance_criteria:
  - Frame-budget overflow triggers an animation-cancel path, not a rule-step skip
  - Critical animations (line-clear sweep) are protected from cancellation
created_at: 2026-05-07T22:18:52.574Z
created_by: human
edges:
  composed_of:
    - id: risk-motion-vs-fps
  mitigates:
    - id: risk-motion-vs-fps
id: frame-overflow-fallback
is_root: false
open_questions: []
owner: architect-agent
parent: risk-motion-vs-fps
private: false
risks: []
status: done
summary: When per-frame budget overruns, cancel non-essential animations (lock-flash, hard-drop trail) before dropping rule-step frames.
tags: []
title: Graceful animation drop when frame budget overruns
type: task
updated_at: 2026-05-07T22:30:28.767Z
---

# Graceful animation drop when frame budget overruns

When per-frame budget overruns, cancel non-essential animations (lock-flash, hard-drop trail) before dropping rule-step frames.

Autobuild iter 3 start: 2026-05-07T22:29:48Z

Implemented: src/loop/animation-budget.ts; Tests: 10/10 pass; protects critical, escalation via dropDecorative()->dropEssential()
