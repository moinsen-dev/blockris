---
acceptance_criteria:
  - DAS (Delayed Auto Shift) and ARR (Auto Repeat Rate) are configurable
  - Soft-drop / hard-drop / hold all wired to standard guideline keys
created_at: 2026-05-07T21:20:10.885Z
created_by: human
edges:
  composed_of:
    - id: goal-root
  decomposes_into:
    - id: keyboard-handler
    - id: das-arr
    - id: pause-and-restart
id: input-controls
is_root: false
open_questions: []
owner: architect-agent
parent: goal-root
private: false
risks: []
status: draft
summary: Keyboard handling (arrows, X/Z rotation, space hard-drop, C hold, P pause); DAS/ARR tunable; reset on game-over.
tags: []
title: Input + Controls
type: subproject
updated_at: 2026-05-07T21:56:23.692Z
---

# Input + Controls

Keyboard handling (arrows, X/Z rotation, space hard-drop, C hold, P pause); DAS/ARR tunable; reset on game-over.
