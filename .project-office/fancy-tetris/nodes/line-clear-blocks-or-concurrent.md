---
acceptance_criteria: []
created_at: 2026-05-07T22:18:52.574Z
created_by: human
edges:
  composed_of:
    - id: risk-motion-vs-fps
  decided_by:
    - id: line-clear-blocking-decision
  derived_from:
    - id: risk-motion-vs-fps
expected_resolution_path: Decide via /project-office:decide once motion-line-clear-sweep timing is finalised
id: line-clear-blocks-or-concurrent
is_root: false
open_questions: []
owner: null
parent: risk-motion-vs-fps
private: false
risks: []
status: done
summary: Classic Tetris pauses gameplay during the line-clear flash. Decide whether the motion.dev sweep blocks the rule-step or runs concurrently with the next piece spawning.
tags: []
target_role: architect
title: Should the line-clear animation block the rule-step?
type: open-question
updated_at: 2026-05-07T22:21:02.570Z
---

# Should the line-clear animation block the rule-step?

Classic Tetris pauses gameplay during the line-clear flash. Decide whether the motion.dev sweep blocks the rule-step or runs concurrently with the next piece spawning.

Resolved by decision line-clear-blocking-decision: sweep blocks the rule-step.
