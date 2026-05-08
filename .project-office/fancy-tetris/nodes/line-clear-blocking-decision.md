---
acceptance_criteria: []
created_at: 2026-05-07T22:20:11.300Z
created_by: human
edges:
  decision_affects:
    - id: line-clear-blocks-or-concurrent
    - id: motion-line-clear-sweep
id: line-clear-blocking-decision
is_root: false
open_questions: []
owner: null
private: false
risks: []
status: done
summary: Line-clear sweep blocks the rule-step
tags: []
title: Line-clear sweep blocks the rule-step
type: decision
updated_at: 2026-05-07T22:20:11.300Z
---

The line-clear sweep animation pauses the rule-step (no new piece spawn, no gravity tick) until the sweep + collapse finish. This matches the classic Tetris Guideline 'line-clear pause' behaviour, keeps the rule-step deterministic and unit-testable (animation cancellation never desyncs logic), and simplifies tween coordination — the sweep owns its window and the rule-step resumes after a single completion callback. The motion-line-clear-sweep task already implies this ordering ('Before clearAndCollapse runs...'); the decision makes it the explicit contract.