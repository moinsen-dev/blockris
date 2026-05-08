# fancy-tetris (project-office plan)

This directory is the planning artifact that drove this codebase. Maintained by [project-office](https://github.com/moinsen-dev/project-office) — a Claude Code workflow tool.

## What's in here

```
project.json                 indexed snapshot (counts, edges, owners)
nodes/                       29 node markdown files with frontmatter
  goal-root.md                 the original goal
  game-core.md                 subproject: pure functional rules
  render-and-motion.md         subproject: DOM + animations
  input-controls.md            subproject: keyboard + DAS/ARR
  progression-and-state.md     subproject: score / level / state
  build-and-deploy.md          subproject: vite + deployment
  risk-motion-vs-fps.md        risk: 60fps vs animation budget
  *.md                         tasks, open-questions, constraints
decisions/                   first-class decision records
  canvas-vs-dom-decision.md
  line-clear-blocking-decision.md
agents/                      role-based ownership state
  architect-agent/             owns most implementation tasks
  test-lead-agent/             owns measurement + stress tests
  office-orchestrator/         coordinator role
.meta/                       lifecycle event log
```

## How the plan was executed

1. **/project-office:init** — created the goal-root + initial decomposition
2. **/project-office:decompose** — split goal into 5 subprojects + 1 risk + 1 open-question
3. **/project-office:traverse** — surfaced bottlenecks (decompose / assign / refine)
4. **/project-office:decide** — recorded 2 architectural decisions
5. **/project-office:autobuild** — autonomously implemented 24 tasks across 4 rounds:
   - in-progress → write code → write tests → green → done
   - hard stop on red tests, manual revert + retry
6. **/project-office:bottlenecks** — final hygiene pass

Final state: 24 tasks done · 0 implementable · 330 tests green · 16 KB bundle live at https://blockris.moinsen.dev

## Why keep this in the repo?

For provenance — anyone reading the codebase can trace why each piece exists, what was considered, what was rejected, and which decisions are load-bearing. The frontmatter on each node-file links to its parent + decisions + acceptance criteria.

To inspect the graph in a UI: `/project-office:run` opens a web tree-view at `localhost:5847`.
