import { afterEach, describe, expect, it } from "bun:test";
import { BOARD_COLS } from "../../game-core/board.ts";
import { createPlayfield } from "../dom-playfield.ts";
import {
	DEFAULT_SWEEP_DURATION_MS,
	SWEEP_CLEARING_ATTR,
	animateLineClear,
} from "../line-clear-sweep.ts";

function mountPlayfield() {
	const host = document.createElement("div");
	document.body.appendChild(host);
	const pf = createPlayfield(host);
	return { host, pf };
}

afterEach(() => {
	document.body.innerHTML = "";
});

const SYNC_SCHEDULER = (cb: () => void, _ms: number) => cb();

describe("animateLineClear", () => {
	it("returns a Promise", () => {
		const { pf } = mountPlayfield();
		const result = animateLineClear(pf, [], { scheduler: SYNC_SCHEDULER });
		expect(result).toBeInstanceOf(Promise);
	});

	it("resolves after the configured duration via the injected scheduler", async () => {
		const { pf } = mountPlayfield();
		let scheduled: { ms: number } | null = null;
		const scheduler = (cb: () => void, ms: number) => {
			scheduled = { ms };
			cb();
		};
		await animateLineClear(pf, [0], { durationMs: 250, scheduler });
		expect(scheduled).not.toBeNull();
		expect(scheduled?.ms).toBe(250);
	});

	it("uses 250ms default duration when none specified", async () => {
		const { pf } = mountPlayfield();
		let scheduledMs = -1;
		const scheduler = (cb: () => void, ms: number) => {
			scheduledMs = ms;
			cb();
		};
		await animateLineClear(pf, [0], { scheduler });
		expect(scheduledMs).toBe(DEFAULT_SWEEP_DURATION_MS);
		expect(DEFAULT_SWEEP_DURATION_MS).toBe(250);
	});

	it("marks every cell in the affected rows with data-clearing during the sweep", () => {
		const { pf } = mountPlayfield();
		// Inspect mid-sweep by using a scheduler that doesn't fire the callback
		const noopScheduler: typeof SYNC_SCHEDULER = () => {};
		animateLineClear(pf, [5, 6], {
			durationMs: 250,
			scheduler: noopScheduler,
		});
		for (const row of [5, 6]) {
			for (let col = 0; col < BOARD_COLS; col++) {
				const cell = pf.getCell(col, row);
				expect(cell?.getAttribute(SWEEP_CLEARING_ATTR)).toBe("true");
			}
		}
	});

	it("removes data-clearing from affected cells after the sweep resolves", async () => {
		const { pf } = mountPlayfield();
		await animateLineClear(pf, [3], { scheduler: SYNC_SCHEDULER });
		for (let col = 0; col < BOARD_COLS; col++) {
			const cell = pf.getCell(col, 3);
			expect(cell?.hasAttribute(SWEEP_CLEARING_ATTR)).toBe(false);
		}
	});

	it("does not touch cells outside the affected rows", () => {
		const { pf } = mountPlayfield();
		const noopScheduler: typeof SYNC_SCHEDULER = () => {};
		animateLineClear(pf, [10], { scheduler: noopScheduler });
		for (let col = 0; col < BOARD_COLS; col++) {
			const c = pf.getCell(col, 5);
			expect(c?.hasAttribute(SWEEP_CLEARING_ATTR)).toBe(false);
		}
	});

	it("handles all 4 simultaneous lines (a Tetris)", async () => {
		const { pf } = mountPlayfield();
		const noopScheduler: typeof SYNC_SCHEDULER = () => {};
		const sweepPromise = animateLineClear(pf, [16, 17, 18, 19], {
			scheduler: noopScheduler,
		});
		expect(sweepPromise).toBeInstanceOf(Promise);
		// All 4 rows × 10 cols = 40 cells should be marked
		let marked = 0;
		for (const row of [16, 17, 18, 19]) {
			for (let col = 0; col < BOARD_COLS; col++) {
				const c = pf.getCell(col, row);
				if (c?.hasAttribute(SWEEP_CLEARING_ATTR)) marked++;
			}
		}
		expect(marked).toBe(40);
	});

	it("with empty rowIndices, resolves without throwing", async () => {
		const { pf } = mountPlayfield();
		await animateLineClear(pf, [], { scheduler: SYNC_SCHEDULER });
		// No cells marked, no errors
		const anyMarked = Array.from(pf.cells).some((c) =>
			c.hasAttribute(SWEEP_CLEARING_ATTR),
		);
		expect(anyMarked).toBe(false);
	});

	it("custom durationMs overrides the default", async () => {
		const { pf } = mountPlayfield();
		let scheduledMs = -1;
		const scheduler = (cb: () => void, ms: number) => {
			scheduledMs = ms;
			cb();
		};
		await animateLineClear(pf, [0], { durationMs: 100, scheduler });
		expect(scheduledMs).toBe(100);
	});

	it("sweep duration is independent of row count (single line)", async () => {
		const { pf } = mountPlayfield();
		let scheduledMs = -1;
		const scheduler = (cb: () => void, ms: number) => {
			scheduledMs = ms;
			cb();
		};
		await animateLineClear(pf, [10], { scheduler });
		expect(scheduledMs).toBe(250);
	});

	it("sweep duration is independent of row count (4 lines)", async () => {
		const { pf } = mountPlayfield();
		let scheduledMs = -1;
		const scheduler = (cb: () => void, ms: number) => {
			scheduledMs = ms;
			cb();
		};
		await animateLineClear(pf, [16, 17, 18, 19], { scheduler });
		expect(scheduledMs).toBe(250);
	});

	it("real setTimeout integration: actually waits ~250ms", async () => {
		const { pf } = mountPlayfield();
		const start = performance.now();
		await animateLineClear(pf, [0], { durationMs: 25 });
		const elapsed = performance.now() - start;
		expect(elapsed).toBeGreaterThanOrEqual(20);
	});
});
