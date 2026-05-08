/**
 * Hard-drop lock-flash. The 4 cells that just locked-down briefly
 * stamp a `data-lock-flash="true"` attribute so the consumer's CSS
 * can paint a 200ms white-flash overlay. The Promise resolves once
 * the flash duration has elapsed and the attribute is removed —
 * the cell's underlying `data-filled` + `data-tetromino` are never
 * touched, so the cells return to their normal fill colour.
 */

import type { Playfield } from "./dom-playfield.ts";

export const DEFAULT_LOCK_FLASH_DURATION_MS = 200;
export const LOCK_FLASH_ATTR = "data-lock-flash";

export type LockFlashScheduler = (callback: () => void, delayMs: number) => void;

const DEFAULT_SCHEDULER: LockFlashScheduler = (cb, ms) => {
	setTimeout(cb, ms);
};

export interface LockFlashOptions {
	durationMs?: number;
	scheduler?: LockFlashScheduler;
}

export type CellCoord = readonly [col: number, row: number];

export function animateLockFlash(
	playfield: Playfield,
	cells: ReadonlyArray<CellCoord>,
	opts: LockFlashOptions = {},
): Promise<void> {
	const duration = opts.durationMs ?? DEFAULT_LOCK_FLASH_DURATION_MS;
	const scheduler = opts.scheduler ?? DEFAULT_SCHEDULER;

	const affected: HTMLElement[] = [];
	for (const [col, row] of cells) {
		const el = playfield.getCell(col, row);
		if (el) {
			el.setAttribute(LOCK_FLASH_ATTR, "true");
			affected.push(el);
		}
	}

	return new Promise<void>((resolve) => {
		scheduler(() => {
			for (const el of affected) {
				el.removeAttribute(LOCK_FLASH_ATTR);
			}
			resolve();
		}, duration);
	});
}
