/**
 * Line-clear sweep animation. Per decision
 * `line-clear-blocking-decision`, the sweep blocks the rule-step:
 * the returned Promise resolves once the sweep is done, and only
 * then does the caller advance to clearAndCollapse + spawn.
 *
 * Visual choice for v1: stamp a `data-clearing` attribute + CSS
 * transition on the affected cells. We export the duration constant
 * so consumer CSS can match (transition: opacity 250ms ease-out).
 *
 * The animator is pluggable via `scheduler` so tests can run on a
 * synchronous clock without waiting 250ms × N tests in real time.
 * Production wiring will swap setTimeout for a motion.dev tween;
 * the call-site contract (Promise<void>) is identical either way.
 */

import { BOARD_COLS } from "../game-core/board.ts";
import type { Playfield } from "./dom-playfield.ts";

export const DEFAULT_SWEEP_DURATION_MS = 250;
export const SWEEP_CLEARING_ATTR = "data-clearing";

export type SweepScheduler = (callback: () => void, delayMs: number) => void;

const DEFAULT_SCHEDULER: SweepScheduler = (cb, ms) => {
	setTimeout(cb, ms);
};

export interface SweepOptions {
	durationMs?: number;
	scheduler?: SweepScheduler;
}

/**
 * Animate the line-clear sweep on the given rows. Resolves when the
 * sweep completes and the cells are ready for clearAndCollapse.
 *
 * Empty rowIndices → resolves on the next tick (still async, so the
 * caller's await is well-defined whether or not lines were cleared).
 */
export function animateLineClear(
	playfield: Playfield,
	rowIndices: ReadonlyArray<number>,
	opts: SweepOptions = {},
): Promise<void> {
	const duration = opts.durationMs ?? DEFAULT_SWEEP_DURATION_MS;
	const scheduler = opts.scheduler ?? DEFAULT_SCHEDULER;

	if (rowIndices.length === 0) {
		return new Promise((resolve) => scheduler(resolve, 0));
	}

	const affected: HTMLElement[] = [];
	for (const row of rowIndices) {
		for (let col = 0; col < BOARD_COLS; col++) {
			const cell = playfield.getCell(col, row);
			if (cell) {
				cell.setAttribute(SWEEP_CLEARING_ATTR, "true");
				affected.push(cell);
			}
		}
	}

	return new Promise<void>((resolve) => {
		scheduler(() => {
			for (const cell of affected) {
				cell.removeAttribute(SWEEP_CLEARING_ATTR);
			}
			resolve();
		}, duration);
	});
}
