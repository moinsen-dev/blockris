import { describe, expect, it } from "bun:test";
import {
	DEFAULT_DAS_ARR,
	createDasArrState,
	tickDas,
} from "../das-arr.ts";

describe("createDasArrState", () => {
	it("uses guideline defaults DAS=170, ARR=50", () => {
		const s = createDasArrState();
		expect(s.config.dasDelay).toBe(170);
		expect(s.config.arrRate).toBe(50);
		expect(DEFAULT_DAS_ARR).toEqual({ dasDelay: 170, arrRate: 50 });
	});

	it("starts idle (heldSince=null, lastFireAt=null)", () => {
		const s = createDasArrState();
		expect(s.heldSince).toBeNull();
		expect(s.lastFireAt).toBeNull();
	});

	it("respects partial config overrides", () => {
		expect(createDasArrState({ dasDelay: 100 }).config.dasDelay).toBe(100);
		expect(createDasArrState({ arrRate: 0 }).config.arrRate).toBe(0);
		expect(createDasArrState({}).config).toEqual(DEFAULT_DAS_ARR);
	});

	it("rejects negative values", () => {
		expect(() => createDasArrState({ dasDelay: -1 })).toThrow();
		expect(() => createDasArrState({ arrRate: -1 })).toThrow();
	});
});

describe("tickDas", () => {
	it("idle + not held → no fire", () => {
		const s = createDasArrState();
		const r = tickDas(s, 0, false);
		expect(r.shouldFire).toBe(false);
		expect(r.state).toBe(s);
	});

	it("press fires immediately", () => {
		const s = createDasArrState();
		const r = tickDas(s, 100, true);
		expect(r.shouldFire).toBe(true);
		expect(r.state.heldSince).toBe(100);
		expect(r.state.lastFireAt).toBe(100);
	});

	it("hold within DAS window does not fire again", () => {
		const s0 = createDasArrState();
		const r1 = tickDas(s0, 0, true); // fire at t=0
		const r2 = tickDas(r1.state, 50, true);
		const r3 = tickDas(r2.state, 100, true);
		const r4 = tickDas(r3.state, 169, true);
		expect(r2.shouldFire).toBe(false);
		expect(r3.shouldFire).toBe(false);
		expect(r4.shouldFire).toBe(false);
	});

	it("first auto-repeat fires when DAS elapses", () => {
		const s = createDasArrState({ dasDelay: 170, arrRate: 50 });
		const r1 = tickDas(s, 0, true);
		const r2 = tickDas(r1.state, 170, true);
		expect(r2.shouldFire).toBe(true);
		expect(r2.state.lastFireAt).toBe(170);
	});

	it("subsequent auto-repeats fire every arrRate ms", () => {
		const s = createDasArrState({ dasDelay: 170, arrRate: 50 });
		let cur = tickDas(s, 0, true).state;
		cur = tickDas(cur, 170, true).state; // first auto-repeat
		const a = tickDas(cur, 220, true);
		expect(a.shouldFire).toBe(true);
		const b = tickDas(a.state, 270, true);
		expect(b.shouldFire).toBe(true);
		const c = tickDas(b.state, 269, true);
		expect(c.shouldFire).toBe(false);
	});

	it("between fires (within arrRate) no fire happens", () => {
		const s = createDasArrState({ dasDelay: 170, arrRate: 50 });
		let cur = tickDas(s, 0, true).state;
		cur = tickDas(cur, 170, true).state;
		// Between t=170 and t=220, no fires
		const checks = [180, 200, 219];
		for (const t of checks) {
			const r = tickDas(cur, t, true);
			expect(r.shouldFire).toBe(false);
		}
	});

	it("release resets state to idle", () => {
		const s0 = createDasArrState();
		const r1 = tickDas(s0, 0, true);
		const r2 = tickDas(r1.state, 100, false);
		expect(r2.shouldFire).toBe(false);
		expect(r2.state.heldSince).toBeNull();
		expect(r2.state.lastFireAt).toBeNull();
	});

	it("re-press after release fires immediately", () => {
		const s = createDasArrState();
		let cur = tickDas(s, 0, true).state;
		cur = tickDas(cur, 200, true).state; // some auto-repeats happen
		cur = tickDas(cur, 250, false).state; // release
		const r = tickDas(cur, 300, true);
		expect(r.shouldFire).toBe(true);
		expect(r.state.heldSince).toBe(300);
	});

	it("idempotent release (already idle, still not held)", () => {
		const s = createDasArrState();
		const r = tickDas(s, 100, false);
		expect(r.state).toBe(s);
		expect(r.shouldFire).toBe(false);
	});

	it("custom DAS=100 / ARR=20 config — fast settings", () => {
		const s = createDasArrState({ dasDelay: 100, arrRate: 20 });
		const fires: number[] = [];
		let cur = s;
		for (let t = 0; t <= 200; t += 10) {
			const r = tickDas(cur, t, true);
			cur = r.state;
			if (r.shouldFire) fires.push(t);
		}
		// Fires expected: t=0 (press), t=100 (DAS expires), t=120,140,160,180,200 (ARR=20)
		expect(fires).toEqual([0, 100, 120, 140, 160, 180, 200]);
	});

	it("ARR=0 means fire every tick after DAS expires", () => {
		const s = createDasArrState({ dasDelay: 100, arrRate: 0 });
		let cur = tickDas(s, 0, true).state;
		// Within DAS: no fire
		expect(tickDas(cur, 50, true).shouldFire).toBe(false);
		cur = tickDas(cur, 100, true).state; // DAS expires → fire
		// After DAS: every tick fires
		const r1 = tickDas(cur, 101, true);
		expect(r1.shouldFire).toBe(true);
		const r2 = tickDas(r1.state, 102, true);
		expect(r2.shouldFire).toBe(true);
	});

	it("is deterministic: identical input sequence → identical outputs", () => {
		const seq: Array<[number, boolean]> = [
			[0, true],
			[50, true],
			[100, true],
			[170, true],
			[220, true],
			[230, false],
			[300, true],
		];
		const a = createDasArrState();
		const b = createDasArrState();
		const aFires: boolean[] = [];
		const bFires: boolean[] = [];
		let aCur = a;
		let bCur = b;
		for (const [t, held] of seq) {
			const ra = tickDas(aCur, t, held);
			const rb = tickDas(bCur, t, held);
			aFires.push(ra.shouldFire);
			bFires.push(rb.shouldFire);
			aCur = ra.state;
			bCur = rb.state;
		}
		expect(aFires).toEqual(bFires);
	});
});
