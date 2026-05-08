---
acceptance_criteria:
  - Sequence of 7 contains all 7 piece types exactly once
  - "Seedable: same seed → same sequence"
created_at: 2026-05-07T21:35:04.184Z
created_by: human
edges:
  composed_of:
    - id: game-core
  derived_from:
    - id: game-core
effort: M
id: bag-randomizer
is_root: false
open_questions: []
owner: architect-agent
parent: game-core
private: false
risks: []
status: done
summary: Each bag of 7 contains exactly one of each tetromino type, shuffled deterministically given a seed.
tags: []
title: 7-bag tetromino randomizer
type: task
updated_at: 2026-05-07T21:50:31.288Z
---

# 7-bag tetromino randomizer

Each bag of 7 contains exactly one of each tetromino type, shuffled deterministically given a seed.

Autobuild it.1 start: 2026-05-07T21:44:23Z

Autobuild it.1 done. Implemented: bag-randomizer.ts (mulberry32 PRNG, Fisher-Yates shuffle, BagRandomizer class with peek). Tests: 13/13 pass.
