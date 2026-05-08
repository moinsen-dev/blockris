---
acceptance_criteria:
  - createDasArrState({dasDelay, arrRate}) returns a state object
  - tickDas(state, now, isHeld) returns whether to fire one more move this tick
  - Default DAS=170ms, ARR=50ms
created_at: 2026-05-07T21:56:23.366Z
created_by: human
edges:
  composed_of:
    - id: input-controls
  depends_on:
    - id: keyboard-handler
id: das-arr
is_root: false
open_questions: []
owner: architect-agent
parent: input-controls
private: false
risks: []
status: done
summary: Delayed Auto Shift + Auto Repeat Rate, guideline defaults DAS=170ms, ARR=50ms, configurable.
tags: []
title: DAS / ARR auto-repeat
type: task
updated_at: 2026-05-08T06:22:36.289Z
---

# DAS / ARR auto-repeat

Delayed Auto Shift + Auto Repeat Rate, guideline defaults DAS=170ms, ARR=50ms, configurable.

Autobuild iter 7 start: 2026-05-08T06:21:47Z

Implemented: src/input/das-arr.ts (createDasArrState, tickDas, DEFAULT_DAS_ARR=170/50); Tests: 16/16 pass; pure-functional, ARR=0 special-case + deterministic sequence test
