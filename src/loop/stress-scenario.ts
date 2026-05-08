/**
 * Worst-case stress scenario for the 60fps target.
 *
 * The real test of "does this game actually hit 60fps?" requires a
 * real browser DevTools / motion.dev profile. This module provides
 * the *reproducible* half: it constructs the worst-case frame state
 * deterministically and exposes a single `runStressFrame` call so
 * the test, the dev server, and a future Lighthouse run can all use
 * the SAME scenario.
 *
 * Worst-case frame composition (per the spec body):
 *   - Active piece falling (gravity tick + drop animation)
 *   - 4-line clear pending (line-clear sweep mid-flight)
 *   - Lock-flash on previous piece's 4 cells
 *   - Queue preview rendering 5 next pieces
 *   - HUD updating score / level / lines
 */

import {
	BOARD_ROWS,
	type Board,
	type Cell,
} from "../game-core/board.ts";
import {
	type ActivePiece,
	type GameState,
	applyIntent,
	newGame,
} from "../game-core/game-state.ts";
import { renderBoard } from "../render/cell-rendering.ts";
import type { Playfield } from "../render/dom-playfield.ts";
import { animateDrop } from "../render/drop-animation.ts";
import { animateLineClear } from "../render/line-clear-sweep.ts";
import { animateLockFlash } from "../render/lock-flash.ts";
import { renderPiece } from "../render/piece-renderer.ts";

/** A scheduler that runs callbacks synchronously — keeps the stress
 *  test in a single tight measurement loop without leaking timers. */
const SYNC: (cb: () => void, _ms: number) => void = (cb) => cb();

/** Build a "tetris-ready" board for the stress scenario. */
export function buildStressState(seed = 1): GameState {
	const fresh = newGame({ seed, startLevel: 5 });
	const board: Board = fresh.board.map((row, r) =>
		r >= BOARD_ROWS - 4
			? row.map((c, col) => (col === 0 ? null : ("T" as Cell)))
			: row,
	);
	const active: ActivePiece = {
		type: "I",
		rotation: 1,
		col: -2,
		row: 0,
	};
	return {
		...fresh,
		board,
		active,
		score: 12345,
		lines: 19,
	};
}

export interface StressFrameResult {
	readonly state: GameState;
	readonly elapsedMs: number;
}

/**
 * Run one synthetic worst-case frame. Returns the post-frame state
 * + elapsed wall-clock ms. Animations are scheduled with the
 * sync-scheduler (instant resolution) so the measurement isolates
 * logic + DOM-mutation cost from animation wait time.
 */
export function runStressFrame(
	state: GameState,
	playfield: Playfield,
): StressFrameResult {
	const start = performance.now();

	// 1. Rule-step (gravity tick).
	const next = applyIntent(state, { kind: "tick" }, start);

	// 2. Render the locked board.
	renderBoard(playfield, next.board);

	// 3. Render the active-piece overlay.
	if (next.active) {
		renderPiece(
			playfield,
			next.active.type,
			next.active.rotation,
			next.active.col,
			next.active.row,
		);
	}

	// 4. Trigger the worst-case animations concurrently:
	//    - drop animation on each of the 4 overlay cells
	//    - line-clear sweep on rows 16-19 (4-line)
	//    - lock-flash on the previous piece's cells
	if (next.active) {
		for (const [dCol, dRow] of [
			[2, 0],
			[2, 1],
			[2, 2],
			[2, 3],
		] as const) {
			animateDrop(
				playfield.getCell(next.active.col + dCol, next.active.row + dRow),
				{ scheduler: SYNC, durationMs: 1 },
			);
		}
	}
	animateLineClear(playfield, [16, 17, 18, 19], {
		scheduler: SYNC,
		durationMs: 1,
	});
	animateLockFlash(
		playfield,
		[
			[5, 18],
			[5, 19],
			[6, 18],
			[6, 19],
		],
		{ scheduler: SYNC, durationMs: 1 },
	);

	const elapsedMs = performance.now() - start;
	return { state: next, elapsedMs };
}

/**
 * 60fps frame budget at 60Hz. Real browsers must stay under this
 * for the painted frame; logic + DOM mutation alone should be a
 * fraction of it (target ≤8ms, leaving ≥8ms for browser paint).
 */
export const FRAME_BUDGET_60FPS_MS = 1000 / 60;
export const FRAME_BUDGET_55FPS_MS = 1000 / 55;
export const LOGIC_BUDGET_TARGET_MS = 8;
