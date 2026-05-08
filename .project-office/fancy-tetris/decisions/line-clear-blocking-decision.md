---
affects:
  - line-clear-blocks-or-concurrent
  - motion-line-clear-sweep
alternatives:
  - name: Concurrent (sweep runs while next piece spawns)
    rationale_against: faster perceived gameplay, but creates timing edge cases on slow hardware (animation falls behind logic), complicates determinism in tests, and risks a spawning piece visually overlapping a clearing row.
  - name: Cancellable sweep (logic continues if sweep dropped)
    rationale_against: best frame-budget behaviour, but the player loses the visual confirmation that the line cleared on a slow frame — UX regression that defeats the 'fancy' goal.
decided_at: 2026-05-07T22:20:11.300Z
decided_by: human
id: line-clear-blocking-decision
status: accepted
supersedes: null
tags: []
title: Line-clear sweep blocks the rule-step
---

# Line-clear sweep blocks the rule-step

## Decision

The line-clear sweep animation pauses the rule-step (no new piece spawn, no gravity tick) until the sweep + collapse finish. This matches the classic Tetris Guideline 'line-clear pause' behaviour, keeps the rule-step deterministic and unit-testable (animation cancellation never desyncs logic), and simplifies tween coordination — the sweep owns its window and the rule-step resumes after a single completion callback. The motion-line-clear-sweep task already implies this ordering ('Before clearAndCollapse runs...'); the decision makes it the explicit contract.

## Alternatives considered

### Concurrent (sweep runs while next piece spawns)

faster perceived gameplay, but creates timing edge cases on slow hardware (animation falls behind logic), complicates determinism in tests, and risks a spawning piece visually overlapping a clearing row.

### Cancellable sweep (logic continues if sweep dropped)

best frame-budget behaviour, but the player loses the visual confirmation that the line cleared on a slow frame — UX regression that defeats the 'fancy' goal.
