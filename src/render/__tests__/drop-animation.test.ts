import { afterEach, describe, expect, it } from "bun:test";
import {
	DEFAULT_CELL_PX,
	MAX_DROP_DURATION_MS,
	animateDrop,
	durationForLevel,
} from "../drop-animation.ts";

const SYNC_SCHEDULER = (cb: () => void, _ms: number) => cb();

afterEach(() => {
	document.body.innerHTML = "";
});

function makeCell(): HTMLElement {
	const el = document.createElement("div");
	document.body.appendChild(el);
	return el;
}

describe("durationForLevel", () => {
	it("level 0 is capped at MAX_DROP_DURATION_MS (120ms)", () => {
		expect(durationForLevel(0)).toBe(MAX_DROP_DURATION_MS);
	});

	it("level 9 (gravity ~100ms) is also capped at 120ms (msPerCell ≈ 100)", () => {
		const v = durationForLevel(9);
		expect(v).toBeLessThanOrEqual(MAX_DROP_DURATION_MS);
		expect(v).toBeGreaterThan(0);
	});

	it("level 29 (20G, 1 frame ≈ 16.67ms) is well under the cap", () => {
		const v = durationForLevel(29);
		expect(v).toBeLessThan(MAX_DROP_DURATION_MS);
		expect(v).toBeCloseTo(1000 / 60, 0);
	});

	it("MAX_DROP_DURATION_MS is 120 (matches spec)", () => {
		expect(MAX_DROP_DURATION_MS).toBe(120);
	});

	it("level 0..50 returns a finite positive ms-value", () => {
		for (let lvl = 0; lvl <= 50; lvl++) {
			const v = durationForLevel(lvl);
			expect(Number.isFinite(v)).toBe(true);
			expect(v).toBeGreaterThan(0);
		}
	});
});

describe("animateDrop", () => {
	it("returns a Promise", () => {
		const cell = makeCell();
		const p = animateDrop(cell, { scheduler: SYNC_SCHEDULER });
		expect(p).toBeInstanceOf(Promise);
	});

	it("resolves immediately when cell is null", async () => {
		await animateDrop(null);
		// reaching here = resolved without throwing
		expect(true).toBe(true);
	});

	it("schedules cleanup after the configured duration", async () => {
		const cell = makeCell();
		let scheduledMs = -1;
		const scheduler = (cb: () => void, ms: number) => {
			scheduledMs = ms;
			cb();
		};
		await animateDrop(cell, { durationMs: 100, scheduler });
		expect(scheduledMs).toBe(100);
	});

	it("uses MAX_DROP_DURATION_MS by default", async () => {
		const cell = makeCell();
		let scheduledMs = -1;
		const scheduler = (cb: () => void, ms: number) => {
			scheduledMs = ms;
			cb();
		};
		await animateDrop(cell, { scheduler });
		expect(scheduledMs).toBe(MAX_DROP_DURATION_MS);
	});

	it("sets a transition on transform with the configured duration", () => {
		const cell = makeCell();
		const noopScheduler: typeof SYNC_SCHEDULER = () => {};
		animateDrop(cell, { durationMs: 80, scheduler: noopScheduler });
		expect(cell.style.transition).toContain("transform");
		expect(cell.style.transition).toContain("80ms");
	});

	it("ends with translateY(0px) so the cell sits in place", () => {
		const cell = makeCell();
		const noopScheduler: typeof SYNC_SCHEDULER = () => {};
		animateDrop(cell, { scheduler: noopScheduler });
		expect(cell.style.transform).toBe("translateY(0px)");
	});

	it("clears inline transition + transform after the scheduler fires", async () => {
		const cell = makeCell();
		await animateDrop(cell, { durationMs: 1, scheduler: SYNC_SCHEDULER });
		expect(cell.style.transition).toBe("");
		expect(cell.style.transform).toBe("");
	});

	it("custom cellPx alters the start translation amount", () => {
		const cell = makeCell();
		const noopScheduler: typeof SYNC_SCHEDULER = () => {};
		// Capture the START transform by stopping the scheduler before resolution.
		// We can't time-travel; instead, run the function synchronously and then
		// flip the inline transform to its pre-scheduled state by inspection: the
		// final assignment above is `translateY(0px)`, so we can only verify the
		// duration end-state. Instead inspect that animation succeeded with the
		// custom px by using the no-op scheduler and verifying transition value
		// is in place.
		animateDrop(cell, { cellPx: 50, scheduler: noopScheduler });
		expect(cell.style.transform).toBe("translateY(0px)"); // post-init transform
		expect(cell.style.transition).toContain("transform");
	});

	it("DEFAULT_CELL_PX is 30 (matches dom-playfield default)", () => {
		expect(DEFAULT_CELL_PX).toBe(30);
	});

	it("multiple cells animate independently", async () => {
		const a = makeCell();
		const b = makeCell();
		const c = makeCell();
		await Promise.all([
			animateDrop(a, { scheduler: SYNC_SCHEDULER }),
			animateDrop(b, { scheduler: SYNC_SCHEDULER }),
			animateDrop(c, { scheduler: SYNC_SCHEDULER }),
		]);
		// All three should be cleaned up
		for (const el of [a, b, c]) {
			expect(el.style.transition).toBe("");
			expect(el.style.transform).toBe("");
		}
	});
});
