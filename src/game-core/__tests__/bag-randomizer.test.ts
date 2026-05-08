import { describe, expect, test } from "bun:test";
import { BagRandomizer, mulberry32, newBag, shuffle } from "../bag-randomizer.ts";
import { TETROMINO_TYPES } from "../tetromino-types.ts";

describe("mulberry32", () => {
	test("same seed → same first 5 values", () => {
		const a = mulberry32(42);
		const b = mulberry32(42);
		for (let i = 0; i < 5; i++) {
			expect(a()).toBe(b());
		}
	});

	test("different seeds → different first values (probabilistic)", () => {
		const a = mulberry32(1);
		const b = mulberry32(2);
		expect(a()).not.toBe(b());
	});

	test("values are in [0, 1)", () => {
		const r = mulberry32(123);
		for (let i = 0; i < 100; i++) {
			const v = r();
			expect(v).toBeGreaterThanOrEqual(0);
			expect(v).toBeLessThan(1);
		}
	});
});

describe("shuffle", () => {
	test("returns array of same length", () => {
		const r = mulberry32(7);
		const out = shuffle([1, 2, 3, 4, 5], r);
		expect(out.length).toBe(5);
	});

	test("contains exactly the same elements (multiset)", () => {
		const r = mulberry32(7);
		const out = shuffle(["a", "b", "c", "d"], r);
		expect([...out].sort()).toEqual(["a", "b", "c", "d"]);
	});

	test("does not mutate input", () => {
		const r = mulberry32(7);
		const input = [1, 2, 3, 4];
		const inputCopy = [...input];
		shuffle(input, r);
		expect(input).toEqual(inputCopy);
	});
});

describe("newBag — AC1: sequence of 7 contains all piece types exactly once", () => {
	test("100 fresh bags each contain all 7 types exactly once", () => {
		for (let seed = 0; seed < 100; seed++) {
			const bag = newBag(mulberry32(seed));
			expect(bag.length).toBe(7);
			expect([...bag].sort()).toEqual([...TETROMINO_TYPES].sort());
		}
	});
});

describe("BagRandomizer — AC2: seedable, same seed → same sequence", () => {
	test("two randomizers with same seed produce identical first 21 pulls (3 bags)", () => {
		const a = new BagRandomizer(2026);
		const b = new BagRandomizer(2026);
		for (let i = 0; i < 21; i++) {
			expect(a.next()).toBe(b.next());
		}
	});

	test("different seeds eventually diverge in the first 7 pulls", () => {
		const a = new BagRandomizer(1);
		const b = new BagRandomizer(2);
		const aSeq: string[] = [];
		const bSeq: string[] = [];
		for (let i = 0; i < 7; i++) {
			aSeq.push(a.next());
			bSeq.push(b.next());
		}
		// Same multiset (both bags have all 7) but different order
		expect([...aSeq].sort()).toEqual([...bSeq].sort());
		expect(aSeq).not.toEqual(bSeq);
	});

	test("auto-refills: 14 pulls return all 7 pieces twice", () => {
		const r = new BagRandomizer(99);
		const counts: Record<string, number> = {};
		for (let i = 0; i < 14; i++) {
			const piece = r.next();
			counts[piece] = (counts[piece] ?? 0) + 1;
		}
		for (const t of TETROMINO_TYPES) {
			expect(counts[t]).toBe(2);
		}
	});
});

describe("BagRandomizer.peek", () => {
	test("peek does not advance the bag", () => {
		const r = new BagRandomizer(5);
		const peeked = r.peek(3);
		const next3 = [r.next(), r.next(), r.next()];
		expect(peeked).toEqual(next3);
	});

	test("peek across bag boundary still returns 10 pieces", () => {
		const r = new BagRandomizer(5);
		const peeked = r.peek(10);
		expect(peeked.length).toBe(10);
		// First 7 are bag1; last 3 are start of bag2.
		expect([...peeked.slice(0, 7)].sort()).toEqual([...TETROMINO_TYPES].sort());
	});
});
