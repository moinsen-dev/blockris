import { describe, expect, test } from "bun:test";
import {
	getKickTable,
	I_KICKS,
	JLSTZ_KICKS,
	rotateBy,
	ROTATIONS,
	shapeOf,
	TETROMINO_TYPES,
	TETROMINOES,
	transitionKey,
	type Rotation,
} from "../tetromino-types.ts";

describe("TETROMINO_TYPES", () => {
	test("has exactly 7 standard pieces", () => {
		expect(TETROMINO_TYPES.length).toBe(7);
		expect([...TETROMINO_TYPES].sort()).toEqual([
			"I",
			"J",
			"L",
			"O",
			"S",
			"T",
			"Z",
		]);
	});

	test("every spec has exactly 4 rotation states with 4 cells each", () => {
		for (const type of TETROMINO_TYPES) {
			const spec = TETROMINOES[type];
			expect(spec.shapes.length).toBe(4);
			for (let rot: Rotation = 0; rot < 4; rot++) {
				expect(spec.shapes[rot as Rotation]!.length).toBe(4);
			}
		}
	});

	test("O-piece has identical shape across all rotations (no rotation effect)", () => {
		const zero = TETROMINOES.O.shapes[0];
		for (const rot of ROTATIONS) {
			expect(TETROMINOES.O.shapes[rot]).toBe(zero);
		}
	});

	test("kick groups: I uses I_KICKS, JLSTZ use JLSTZ_KICKS, O has none", () => {
		expect(getKickTable("I")).toBe(I_KICKS);
		expect(getKickTable("J")).toBe(JLSTZ_KICKS);
		expect(getKickTable("L")).toBe(JLSTZ_KICKS);
		expect(getKickTable("S")).toBe(JLSTZ_KICKS);
		expect(getKickTable("T")).toBe(JLSTZ_KICKS);
		expect(getKickTable("Z")).toBe(JLSTZ_KICKS);
		expect(getKickTable("O")).toBeNull();
	});
});

describe("shape correctness (T-piece spot-check)", () => {
	test("T at rotation 0 has the bump on top — cells [(1,0),(0,1),(1,1),(2,1)]", () => {
		expect(shapeOf("T", 0)).toEqual([
			[1, 0],
			[0, 1],
			[1, 1],
			[2, 1],
		]);
	});

	test("T at rotation 2 has the bump on bottom — cells [(0,1),(1,1),(2,1),(1,2)]", () => {
		expect(shapeOf("T", 2)).toEqual([
			[0, 1],
			[1, 1],
			[2, 1],
			[1, 2],
		]);
	});
});

describe("shape sanity — every cell offset is in a 4×4 bbox", () => {
	test("no offset has col or row >= 4", () => {
		for (const type of TETROMINO_TYPES) {
			for (const rot of ROTATIONS) {
				for (const [col, row] of TETROMINOES[type].shapes[rot]) {
					expect(col).toBeGreaterThanOrEqual(0);
					expect(col).toBeLessThan(4);
					expect(row).toBeGreaterThanOrEqual(0);
					expect(row).toBeLessThan(4);
				}
			}
		}
	});
});

describe("rotateBy", () => {
	test("rotateBy +1 cycles 0→1→2→3→0", () => {
		expect(rotateBy(0, 1)).toBe(1);
		expect(rotateBy(1, 1)).toBe(2);
		expect(rotateBy(2, 1)).toBe(3);
		expect(rotateBy(3, 1)).toBe(0);
	});

	test("rotateBy -1 cycles 0→3→2→1→0", () => {
		expect(rotateBy(0, -1)).toBe(3);
		expect(rotateBy(3, -1)).toBe(2);
		expect(rotateBy(2, -1)).toBe(1);
		expect(rotateBy(1, -1)).toBe(0);
	});
});

describe("transitionKey", () => {
	test("clockwise transitions", () => {
		expect(transitionKey(0, 1)).toBe("0->R");
		expect(transitionKey(1, 2)).toBe("R->2");
		expect(transitionKey(2, 3)).toBe("2->L");
		expect(transitionKey(3, 0)).toBe("L->0");
	});

	test("counter-clockwise transitions", () => {
		expect(transitionKey(1, 0)).toBe("R->0");
		expect(transitionKey(2, 1)).toBe("2->R");
		expect(transitionKey(3, 2)).toBe("L->2");
		expect(transitionKey(0, 3)).toBe("0->L");
	});

	test("non-adjacent (180°) transitions return null", () => {
		expect(transitionKey(0, 2)).toBeNull();
		expect(transitionKey(1, 3)).toBeNull();
	});
});

describe("kick tables — every transition has 4 fallback offsets", () => {
	test("JLSTZ kick table has all 8 transitions × 4 offsets", () => {
		const transitions = [
			"0->R", "R->0", "R->2", "2->R",
			"2->L", "L->2", "L->0", "0->L",
		] as const;
		for (const t of transitions) {
			expect(JLSTZ_KICKS[t]).toBeDefined();
			expect(JLSTZ_KICKS[t].length).toBe(4);
		}
	});

	test("I kick table has all 8 transitions × 4 offsets", () => {
		const transitions = [
			"0->R", "R->0", "R->2", "2->R",
			"2->L", "L->2", "L->0", "0->L",
		] as const;
		for (const t of transitions) {
			expect(I_KICKS[t]).toBeDefined();
			expect(I_KICKS[t].length).toBe(4);
		}
	});

	test("I and JLSTZ kick tables are different (I is the special case)", () => {
		expect(I_KICKS["0->R"]).not.toEqual(JLSTZ_KICKS["0->R"]);
	});
});
