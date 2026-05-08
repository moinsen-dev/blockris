---
acceptance_criteria:
  - 1/2/3/4-row clears return correct count
  - Cells above cleared rows shift down deterministically
created_at: 2026-05-07T21:35:04.184Z
created_by: human
edges:
  composed_of:
    - id: game-core
  derived_from:
    - id: game-core
effort: M
id: line-clear
is_root: false
open_questions: []
owner: architect-agent
parent: game-core
private: false
risks: []
status: done
summary: Detect filled rows, clear them, drop remaining rows down. Returns count for scoring.
tags: []
title: Line-clear detection + collapse
type: task
updated_at: 2026-05-07T21:50:31.515Z
---

# Line-clear detection + collapse

Detect filled rows, clear them, drop remaining rows down. Returns count for scoring.

it.4 start: 2026-05-07T21:47:28Z

it.4 done. line-clear.ts (~75 lines): detectFullRows, clearAndCollapse with no-op fast path. Tests 11/11 pass — verifies 1/2/3/4-row clears + shift-down semantics + survivor preservation.
