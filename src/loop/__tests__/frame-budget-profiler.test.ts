import { describe, expect, it } from "bun:test";
import { createFrameBudgetProfiler } from "../frame-budget-profiler.ts";

describe("frame-budget-profiler", () => {
	it("is disabled by default and recordFrame is a no-op", () => {
		const p = createFrameBudgetProfiler();
		expect(p.enabled).toBe(false);
		p.recordFrame({ logicMs: 1.2, renderMs: 3.4 });
		p.recordFrame({ logicMs: 9.9, renderMs: 0.1 });
		expect(p.sampleCount).toBe(0);
		expect(p.summary()).toBeNull();
	});

	it("records samples when enabled", () => {
		const p = createFrameBudgetProfiler({ enabled: true });
		p.recordFrame({ logicMs: 2, renderMs: 5 });
		p.recordFrame({ logicMs: 4, renderMs: 6 });
		expect(p.sampleCount).toBe(2);
	});

	it("summary returns null with no samples", () => {
		const p = createFrameBudgetProfiler({ enabled: true });
		expect(p.summary()).toBeNull();
	});

	it("computes avg / p95 / max for logic, render, and total", () => {
		const p = createFrameBudgetProfiler({ enabled: true });
		// logic: 1..20 (avg 10.5, p95 19, max 20)
		for (let i = 1; i <= 20; i++) {
			p.recordFrame({ logicMs: i, renderMs: 100 - i });
		}
		const s = p.summary()!;
		expect(s.samples).toBe(20);
		expect(s.logic.count).toBe(20);
		expect(s.logic.avg).toBeCloseTo(10.5, 6);
		expect(s.logic.max).toBe(20);
		// p95 of 1..20 sorted: ceil(20*0.95)=19 → index 18 → value 19
		expect(s.logic.p95).toBe(19);
		// render values are 99..80 sorted → 80..99
		expect(s.render.max).toBe(99);
		expect(s.render.avg).toBeCloseTo(89.5, 6);
		// total = logic + render = always 100 in this construction
		expect(s.total.avg).toBeCloseTo(100, 6);
		expect(s.total.max).toBe(100);
	});

	it("p95 of single sample equals that sample", () => {
		const p = createFrameBudgetProfiler({ enabled: true });
		p.recordFrame({ logicMs: 7, renderMs: 3 });
		const s = p.summary()!;
		expect(s.logic.p95).toBe(7);
		expect(s.logic.max).toBe(7);
		expect(s.logic.avg).toBe(7);
	});

	it("CSV output has the expected header + rows", () => {
		const p = createFrameBudgetProfiler({ enabled: true });
		p.recordFrame({ logicMs: 1, renderMs: 2 });
		p.recordFrame({ logicMs: 3, renderMs: 4 });
		const csv = p.toCSV();
		const lines = csv.split("\n");
		expect(lines[0]).toBe("frame,logic_ms,render_ms,total_ms");
		expect(lines[1]).toBe("0,1,2,3");
		expect(lines[2]).toBe("1,3,4,7");
	});

	it("reset clears samples", () => {
		const p = createFrameBudgetProfiler({ enabled: true });
		p.recordFrame({ logicMs: 1, renderMs: 1 });
		p.recordFrame({ logicMs: 2, renderMs: 2 });
		p.reset();
		expect(p.sampleCount).toBe(0);
		expect(p.summary()).toBeNull();
	});

	it("maxSamples caps retained samples (FIFO)", () => {
		const p = createFrameBudgetProfiler({ enabled: true, maxSamples: 3 });
		for (let i = 0; i < 5; i++) {
			p.recordFrame({ logicMs: i, renderMs: 0 });
		}
		expect(p.sampleCount).toBe(3);
		const csv = p.toCSV().split("\n");
		// header + 3 rows; oldest two (0,1) dropped → values 2,3,4
		expect(csv.length).toBe(4);
		expect(csv[1]).toBe("0,2,0,2");
		expect(csv[2]).toBe("1,3,0,3");
		expect(csv[3]).toBe("2,4,0,4");
	});

	it("60-frame realistic-shaped session produces sane stats", () => {
		const p = createFrameBudgetProfiler({ enabled: true });
		// All under 16.67ms target with one outlier
		for (let i = 0; i < 60; i++) {
			p.recordFrame({ logicMs: 2 + (i % 3), renderMs: 5 + (i % 5) });
		}
		p.recordFrame({ logicMs: 30, renderMs: 30 }); // outlier
		const s = p.summary()!;
		expect(s.samples).toBe(61);
		expect(s.total.max).toBe(60);
		expect(s.total.avg).toBeLessThan(16.67);
	});

	it("disabled flag is observable and stable across calls", () => {
		const off = createFrameBudgetProfiler({ enabled: false });
		const on = createFrameBudgetProfiler({ enabled: true });
		expect(off.enabled).toBe(false);
		expect(on.enabled).toBe(true);
	});
});
