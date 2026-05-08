---
acceptance_criteria:
  - bun run dev starts a dev server
  - bun run build produces a static bundle under dist/
  - index.html exists at project root with a <div id='app'></div>
created_at: 2026-05-07T21:56:23.531Z
created_by: human
edges:
  blocks:
    - id: main-entry
  composed_of:
    - id: build-and-deploy
id: vite-setup
is_root: false
open_questions: []
owner: architect-agent
parent: build-and-deploy
private: false
risks: []
status: done
summary: "Add Vite + vite.config.ts. Entry: index.html → src/main.ts. bun run dev / bun run build."
tags: []
title: Vite dev-server + build
type: task
updated_at: 2026-05-08T06:35:51.500Z
---

# Vite dev-server + build

Add Vite + vite.config.ts. Entry: index.html → src/main.ts. bun run dev / bun run build.

Autobuild iter 15 start: 2026-05-08T06:34:55Z

Implemented: vite@8.0.11 + vite.config.ts + index.html (#app + scoped CSS for piece-overlay/clearing/lock-flash) + stub src/main.ts; Verified: bun run build → dist/index.html + dist/assets/*.js (1.69KB + sourcemap); bun run dev → ready in 78ms on :5173, /src/main.ts transformed; full suite still 308/308
