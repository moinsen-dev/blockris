---
acceptance_criteria:
  - Rule-step is deterministic and unit-testable without DOM
  - Animation cancellation never affects rule-step state
created_at: 2026-05-07T22:18:52.573Z
created_by: human
edges:
  composed_of:
    - id: risk-motion-vs-fps
  mitigates:
    - id: risk-motion-vs-fps
id: decouple-tick-from-tween
is_root: false
open_questions: []
owner: architect-agent
parent: risk-motion-vs-fps
private: false
risks: []
status: done
summary: Rule-step (gravity, rotate, lock, line-clear) runs on a deterministic logic tick independent of motion.dev's animation frame; animations are visual-only.
tags: []
title: Decouple rule-tick from animation tween
type: task
updated_at: 2026-05-07T22:27:47.429Z
---

# Decouple rule-tick from animation tween

Rule-step (gravity, rotate, lock, line-clear) runs on a deterministic logic tick independent of motion.dev's animation frame; animations are visual-only.

Autobuild iter 1 start: 2026-05-07T22:26:44Z

Implemented: src/loop/tick-driver.ts; Tests: src/loop/__tests__/tick-driver.test.ts (11/11 pass)

Reverted from done: test suite was red; mark-done landed because exit-code pipe corruption (| tail) hid bun test failure

Implemented: src/loop/tick-driver.ts; Tests: src/loop/__tests__/tick-driver.test.ts (11/11 pass)
