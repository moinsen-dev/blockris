import { afterEach, describe, expect, it } from "bun:test";
import { emptyBoard } from "../../game-core/board.ts";
import { TETROMINOES } from "../../game-core/tetromino-types.ts";
import { renderBoard } from "../cell-rendering.ts";
import { createPlayfield } from "../dom-playfield.ts";
import {
	DEFAULT_LOCK_FLASH_DURATION_MS,
	LOCK_FLASH_ATTR,
	animateLockFlash,
} from "../lock-flash.ts";

const SYNC_SCHEDULER = (cb: () => void, _ms: number) => cb();

afterEach(() => {
	document.body.innerHTML = "";
});

function mount() {
	const host = document.createElement("div");
	document.body.appendChild(host);
	const pf = createPlayfield(host);
	return { host, pf };
}

describe("animateLockFlash", () => {
	it("returns a Promise", () => {
		const { pf } = mount();
		const r = animateLockFlash(pf, [], { scheduler: SYNC_SCHEDULER });
		expect(r).toBeInstanceOf(Promise);
	});

	it("default duration is 200ms", async () => {
		const { pf } = mount();
		let scheduledMs = -1;
		const scheduler = (cb: () => void, ms: number) => {
			scheduledMs = ms;
			cb();
		};
		await animateLockFlash(pf, [[0, 0]], { scheduler });
		expect(scheduledMs).toBe(DEFAULT_LOCK_FLASH_DURATION_MS);
		expect(DEFAULT_LOCK_FLASH_DURATION_MS).toBe(200);
	});

	it("custom duration is honoured", async () => {
		const { pf } = mount();
		let scheduledMs = -1;
		const scheduler = (cb: () => void, ms: number) => {
			scheduledMs = ms;
			cb();
		};
		await animateLockFlash(pf, [[0, 0]], { durationMs: 50, scheduler });
		expect(scheduledMs).toBe(50);
	});

	it("stamps data-lock-flash on each cell during the flash", () => {
		const { pf } = mount();
		const noopScheduler = (() => {}) as typeof SYNC_SCHEDULER;
		animateLockFlash(
			pf,
			[
				[3, 5],
				[4, 5],
				[5, 5],
				[6, 5],
			],
			{ scheduler: noopScheduler },
		);
		for (const [c, r] of [
			[3, 5],
			[4, 5],
			[5, 5],
			[6, 5],
		] as const) {
			expect(pf.getCell(c, r)?.getAttribute(LOCK_FLASH_ATTR)).toBe("true");
		}
	});

	it("removes data-lock-flash after the scheduler fires", async () => {
		const { pf } = mount();
		await animateLockFlash(pf, [[3, 5]], { scheduler: SYNC_SCHEDULER });
		expect(pf.getCell(3, 5)?.hasAttribute(LOCK_FLASH_ATTR)).toBe(false);
	});

	it("cells end at their normal fill colour (no white residue)", async () => {
		const { pf } = mount();
		// Pre-paint the cells with type T so they have a fill.
		const board = emptyBoard().map((row, r) =>
			r === 19 ? row.map((c, col) => (col >= 3 && col <= 6 ? "T" : c)) : row,
		);
		renderBoard(pf, board);
		// Now flash the same cells.
		await animateLockFlash(
			pf,
			[
				[3, 19],
				[4, 19],
				[5, 19],
				[6, 19],
			],
			{ scheduler: SYNC_SCHEDULER },
		);
		// After the flash, cells still report data-filled + correct background.
		const expectedColor = TETROMINOES.T.color;
		for (const [c, r] of [
			[3, 19],
			[4, 19],
			[5, 19],
			[6, 19],
		] as const) {
			const el = pf.getCell(c, r);
			expect(el?.hasAttribute(LOCK_FLASH_ATTR)).toBe(false);
			expect(el?.getAttribute("data-filled")).toBe("true");
			expect(el?.getAttribute("data-tetromino")).toBe("T");
			expect(el?.style.background).toBe(expectedColor);
		}
	});

	it("empty cells array resolves without error", async () => {
		const { pf } = mount();
		await animateLockFlash(pf, [], { scheduler: SYNC_SCHEDULER });
		// reaching here = resolved
		expect(true).toBe(true);
	});

	it("off-board cells are silently skipped", async () => {
		const { pf } = mount();
		await animateLockFlash(
			pf,
			[
				[-1, 0], // out
				[0, -1], // out
				[10, 0], // out
				[0, 20], // out
				[5, 5], // in
			],
			{ scheduler: SYNC_SCHEDULER },
		);
		// in-bounds cell was processed (and cleaned)
		expect(pf.getCell(5, 5)?.hasAttribute(LOCK_FLASH_ATTR)).toBe(false);
	});

	it("flashes do not interfere across non-overlapping cells", async () => {
		const { pf } = mount();
		const noopScheduler = (() => {}) as typeof SYNC_SCHEDULER;
		animateLockFlash(pf, [[2, 2]], { scheduler: noopScheduler });
		animateLockFlash(pf, [[7, 7]], { scheduler: noopScheduler });
		expect(pf.getCell(2, 2)?.hasAttribute(LOCK_FLASH_ATTR)).toBe(true);
		expect(pf.getCell(7, 7)?.hasAttribute(LOCK_FLASH_ATTR)).toBe(true);
		expect(pf.getCell(0, 0)?.hasAttribute(LOCK_FLASH_ATTR)).toBe(false);
	});

	it("integration with real setTimeout: actually waits for the duration", async () => {
		const { pf } = mount();
		const start = performance.now();
		await animateLockFlash(pf, [[5, 5]], { durationMs: 25 });
		const elapsed = performance.now() - start;
		expect(elapsed).toBeGreaterThanOrEqual(20);
	});
});
