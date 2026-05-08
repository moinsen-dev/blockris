---
acceptance_criteria:
  - bun run build produces a single static bundle <=200KB gzip
  - CI runs on every push and blocks merge on TS-error or lint-fail
created_at: 2026-05-07T21:20:10.885Z
created_by: human
edges:
  composed_of:
    - id: goal-root
  decomposes_into:
    - id: vite-setup
    - id: main-entry
id: build-and-deploy
is_root: false
open_questions: []
owner: architect-agent
parent: goal-root
private: false
risks: []
status: draft
summary: Vite + TS strict mode; deploy to a static host (GitHub Pages or moinsen.dev subdomain); CI build on push.
tags: []
title: Build + Deploy
type: subproject
updated_at: 2026-05-07T21:56:23.874Z
---

# Build + Deploy

Vite + TS strict mode; deploy to a static host (GitHub Pages or moinsen.dev subdomain); CI build on push.
