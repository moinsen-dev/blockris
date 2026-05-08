---
affects:
  - render-and-motion
  - q-canvas-vs-dom
alternatives:
  - name: Canvas-2D
    rationale_against: Cheaper per-frame, no DOM overhead, but motion.dev becomes a thin wrapper over manual draw calls. Loses the project's stated motion.dev-as-choreographer benefit.
decided_at: 2026-05-07T21:54:19.894Z
decided_by: architect-agent
id: canvas-vs-dom-decision
status: accepted
supersedes: null
tags: []
title: DOM + motion.dev (not Canvas-2D)
---

# DOM + motion.dev (not Canvas-2D)

## Decision

Project goal explicitly names motion.dev. DOM-with-CSS-transforms gives motion.dev the per-cell elements it needs to choreograph drop/lock-flash/line-clear-sweep animations. Canvas-2D would be lighter on rendering cost but reduce motion.dev to manual canvas redraws — defeats the 'fancy' goal. We accept the per-cell DOM-element overhead (200 cells max) for the animation ergonomics.

## Alternatives considered

### Canvas-2D

Cheaper per-frame, no DOM overhead, but motion.dev becomes a thin wrapper over manual draw calls. Loses the project's stated motion.dev-as-choreographer benefit.
