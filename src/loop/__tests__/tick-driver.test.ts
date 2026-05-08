import { describe, expect, it } from "bun:test";
import { createTickDriver } from "../tick-driver.ts";

describe("tick-driver", () => {
	it("emits zero ticks when no time has passed", () => {
		const d = createTickDriver({ msPerTick: 800 });
		expect(d.advance(0)).toBe(0);
	});

	it("emits exactly one tick when one rate-period has passed", () => {
		const d = createTickDriver({ msPerTick: 800 });
		expect(d.advance(800)).toBe(1);
	});

	it("emits floor(elapsed/rate) ticks per advance and remembers the remainder", () => {
		const d = createTickDriver({ msPerTick: 100 });
		expect(d.advance(250)).toBe(2);
		expect(d.accumulatorMs).toBe(50);
		expect(d.advance(50)).toBe(1);
		expect(d.advance(0)).toBe(0);
	});

	it("is deterministic across identical input sequences", () => {
		const a = createTickDriver({ msPerTick: 333 });
		const b = createTickDriver({ msPerTick: 333 });
		const sequence = [100, 250, 99, 1, 600, 17];
		const aResults = sequence.map((s) => a.advance(s));
		const bResults = sequence.map((s) => b.advance(s));
		expect(aResults).toEqual(bResults);
		expect(a.accumulatorMs).toBe(b.accumulatorMs);
	});

	it("setRate updates cadence without dropping accumulator", () => {
		const d = createTickDriver({ msPerTick: 800 });
		d.advance(400);
		d.setRate(100);
		expect(d.advance(0)).toBe(4);
	});

	it("reset drops accumulator", () => {
		const d = createTickDriver({ msPerTick: 100 });
		d.advance(75);
		d.reset();
		expect(d.advance(50)).toBe(0);
	});

	it("ignores negative or zero elapsedMs (clock-jump / pause guard)", () => {
		const d = createTickDriver({ msPerTick: 100 });
		d.advance(50);
		expect(d.advance(-1000)).toBe(0);
		expect(d.advance(0)).toBe(0);
		expect(d.advance(50)).toBe(1);
	});

	it("rejects non-positive rate at construction and on setRate", () => {
		expect(() => createTickDriver({ msPerTick: 0 })).toThrow();
		expect(() => createTickDriver({ msPerTick: -1 })).toThrow();
		const d = createTickDriver({ msPerTick: 100 });
		expect(() => d.setRate(0)).toThrow();
		expect(() => d.setRate(-50)).toThrow();
	});

	it("animation cancellation cannot desync the driver", () => {
		// The driver holds no animation handle, so a cancel() call
		// from the animation layer is a no-op for logic. This test
		// simulates the scenario explicitly: a fake animation is
		// cancelled mid-game; the driver keeps firing on schedule.
		const d = createTickDriver({ msPerTick: 800 });
		const fakeAnimationHandle = {
			cancelled: false,
			cancel() {
				this.cancelled = true;
			},
		};
		expect(d.advance(800)).toBe(1);
		fakeAnimationHandle.cancel();
		expect(fakeAnimationHandle.cancelled).toBe(true);
		expect(d.advance(1600)).toBe(2);
		expect(d.advance(800)).toBe(1);
	});

	it("accumulatorMs and msPerTick expose internal state for diagnostics", () => {
		const d = createTickDriver({ msPerTick: 100 });
		d.advance(75);
		expect(d.accumulatorMs).toBe(75);
		expect(d.msPerTick).toBe(100);
	});

	it("at 20G rate (1 frame ≈ 16.67ms) emits one tick per frame", () => {
		const d = createTickDriver({ msPerTick: 1000 / 60 });
		// 10 frames worth of time
		expect(d.advance((1000 / 60) * 10)).toBe(10);
	});
});
