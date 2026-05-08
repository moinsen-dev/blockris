/**
 * Gravity-tick drop animation. When the active piece moves down by
 * one row, we want it to *interpolate* into the new position rather
 * than jump. The trick is "animate from the OLD position TO the
 * current position": we apply a starting transform that visually
 * places the cell one row up, then transition the transform back to
 * 0 so the cell glides down to where it already is logically.
 *
 * Per the gravity-curve, level 0 = 800ms-per-cell — way too slow to
 * be visually pleasant. We cap the animation at 120ms so the player
 * always sees crisp drops at low levels but the rule-step still
 * runs at the gravity rate. At high levels (≥ ~7 → ≤120ms/cell)
 * the animation simply matches the gravity rate.
 */

import { msPerCell } from "../game-core/gravity.ts";

export const MAX_DROP_DURATION_MS = 120;
export const DEFAULT_CELL_PX = 30;

export type DropScheduler = (callback: () => void, delayMs: number) => void;

const DEFAULT_SCHEDULER: DropScheduler = (cb, ms) => {
	setTimeout(cb, ms);
};

export interface DropAnimationOptions {
	durationMs?: number;
	cellPx?: number;
	scheduler?: DropScheduler;
}

/**
 * Animation duration for a single gravity-cell at the given level.
 * Returns `msPerCell(level)` capped at MAX_DROP_DURATION_MS.
 */
export function durationForLevel(level: number): number {
	return Math.min(MAX_DROP_DURATION_MS, msPerCell(level));
}

/**
 * Animate a single piece-overlay cell sliding down by one row.
 * Called by the consumer for each overlay cell after a successful
 * gravity tick (the cells are already in their new logical position
 * — this animation is purely visual).
 */
export function animateDrop(
	cell: HTMLElement | null,
	opts: DropAnimationOptions = {},
): Promise<void> {
	if (!cell) return Promise.resolve();

	const duration = opts.durationMs ?? MAX_DROP_DURATION_MS;
	const cellPx = opts.cellPx ?? DEFAULT_CELL_PX;
	const scheduler = opts.scheduler ?? DEFAULT_SCHEDULER;

	// Start the cell visually one row up...
	cell.style.transition = "none";
	cell.style.transform = `translateY(${-cellPx}px)`;
	// ...force the browser to commit that style before re-armed transition.
	void cell.offsetHeight;
	// ...then transition smoothly back to the actual position.
	cell.style.transition = `transform ${duration}ms ease-out`;
	cell.style.transform = "translateY(0px)";

	return new Promise<void>((resolve) => {
		scheduler(() => {
			cell.style.transition = "";
			cell.style.transform = "";
			resolve();
		}, duration);
	});
}
