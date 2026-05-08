import { describe, expect, test } from "bun:test";
import {
	levelFor,
	lineClearName,
	linesToNextLevel,
	scoreForLines,
} from "../scoring.ts";

describe("scoreForLines — AC1: 4-line clear at level 5 scores 4000", () => {
	test("the canonical AC", () => {
		expect(scoreForLines(4, 5)).toBe(4000);
	});

	test("standard scoring at level 1", () => {
		expect(scoreForLines(0, 1)).toBe(0);
		expect(scoreForLines(1, 1)).toBe(100);
		expect(scoreForLines(2, 1)).toBe(300);
		expect(scoreForLines(3, 1)).toBe(500);
		expect(scoreForLines(4, 1)).toBe(800);
	});

	test("scales linearly with level", () => {
		expect(scoreForLines(1, 10)).toBe(1000);
		expect(scoreForLines(4, 10)).toBe(8000);
	});

	test("level 0 clamps to 1 (no zero-score game-start)", () => {
		expect(scoreForLines(4, 0)).toBe(800);
	});

	test("invalid line counts throw", () => {
		expect(() => scoreForLines(-1, 1)).toThrow();
		expect(() => scoreForLines(5, 1)).toThrow();
		expect(() => scoreForLines(1.5, 1)).toThrow();
	});
});

describe("levelFor — AC2: level increments after every 10 lines", () => {
	test("0..9 lines stay at startLevel", () => {
		expect(levelFor(0)).toBe(1);
		expect(levelFor(5)).toBe(1);
		expect(levelFor(9)).toBe(1);
	});

	test("10 lines → level 2", () => {
		expect(levelFor(10)).toBe(2);
	});

	test("100 lines → level 11 (with default startLevel=1)", () => {
		expect(levelFor(100)).toBe(11);
	});

	test("respects startLevel", () => {
		expect(levelFor(0, 5)).toBe(5);
		expect(levelFor(10, 5)).toBe(6);
		expect(levelFor(50, 5)).toBe(10);
	});
});

describe("linesToNextLevel", () => {
	test("freshly-leveled-up: 10 lines remain to next", () => {
		expect(linesToNextLevel(0)).toBe(10);
		expect(linesToNextLevel(10)).toBe(10);
		expect(linesToNextLevel(20)).toBe(10);
	});

	test("partway through a level", () => {
		expect(linesToNextLevel(3)).toBe(7);
		expect(linesToNextLevel(15)).toBe(5);
	});

	test("one line away from level-up", () => {
		expect(linesToNextLevel(9)).toBe(1);
	});
});

describe("lineClearName", () => {
	test("the four canonical names", () => {
		expect(lineClearName(1)).toBe("Single");
		expect(lineClearName(2)).toBe("Double");
		expect(lineClearName(3)).toBe("Triple");
		expect(lineClearName(4)).toBe("Tetris");
	});

	test("0 lines returns empty string", () => {
		expect(lineClearName(0)).toBe("");
	});
});
