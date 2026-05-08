# Blockris

A clean, minimal falling-blocks game in TypeScript. SRS rotation, 7-bag randomizer, DAS/ARR — the classic feel without the trademark.

🎮 **Play live**: https://blockris.moinsen.dev

## Controls

| Key | Action |
|---|---|
| `←` / `→` | Move (DAS-driven) |
| `↓` | Soft drop |
| `Space` | Hard drop |
| `↑` / `X` | Rotate clockwise |
| `Z` | Rotate counter-clockwise |
| `C` | Hold piece |
| `P` | Pause / resume |
| `R` | Restart |

## Features

- 10 × 20 playfield, 7 standard tetrominoes (I, O, T, S, Z, J, L)
- Super Rotation System (SRS) with full wall-kick tables
- 7-bag randomizer (every piece appears once per 7-cycle)
- DAS / ARR auto-repeat (guideline defaults: 170 ms / 50 ms)
- Score / level / lines HUD with Tetris-guideline-2009 scoring
- Hold piece + 5-piece next-queue preview
- Ghost-piece landing preview
- Lock-flash + line-clear sweep animations

## Architecture

Pure-functional rule-step decoupled from rendering. The rule-step (`applyIntent`) is deterministic, side-effect-free, and DOM-free — every gameplay decision is a unit-testable transform from `(state, intent)` to `state`.

```
src/
  game-core/         pure functional state
    board.ts            10×20 grid, immutable
    tetromino-types.ts  7 pieces + SRS tables
    bag-randomizer.ts   seeded 7-bag PRNG
    gravity.ts          drop logic + level curve
    line-clear.ts       row detection + collapse
    scoring.ts          guideline-2009 scoring
    game-state.ts       reducer (newGame, applyIntent)
  loop/              tick-driver + budget profilers
  input/             keyboard + DAS/ARR
  render/            DOM playfield + animations + HUD
  main.ts            game-loop wiring
```

## Development

```bash
bun install
bun run dev     # vite dev server on :5173
bun test        # 330 tests
bun run build   # static bundle in dist/ (~16 KB / 5 KB gzip)
```

## Project history

This codebase was planned and executed end-to-end through the [project-office](https://github.com/moinsen-dev/project-office) plugin — a Claude Code workflow that decomposes a goal into nodes (subprojects, tasks, risks, decisions, open-questions), assigns owners, tracks bottlenecks, and drives an autobuild loop that implements every leaf-task with tests.

The full plan, decisions, and lifecycle log live in [`.project-office/fancy-tetris/`](.project-office/fancy-tetris/). 24 tasks executed across 4 autobuild rounds. Two architectural decisions logged:

- **DOM + motion.dev for rendering** (vs canvas-2D) — chosen for cell-by-cell choreography
- **Line-clear sweep blocks the rule-step** — sweep owns its window, rule-step waits for completion

## Why "Blockris" and not "Tetris"?

"Tetris" is a registered trademark of The Tetris Company. The game's visual presentation (10×20 playfield, the 7 specific tetromino shapes, line-clear behavior) is also protected as trade dress per *Tetris Holding v. Xio Interactive*. To avoid trademark friction, this project uses an independent name + a distinct pastel colour palette while keeping the gameplay rules every player already knows.

## License

MIT — see [LICENSE](LICENSE) (to be added).
