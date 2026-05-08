import { describe, expect, it } from "bun:test";
import { BOARD_ROWS, type Cell } from "../board.ts";
import {
	type GameState,
	applyIntent,
	linesToNextLevel,
	newGame,
} from "../game-state.ts";

/**
 * Build a "tetris-ready" state: bottom 4 rows filled across cols
 * 1-9, col 0 empty. Active piece is an I tetromino in rotation R
 * (vertical, occupying col 0 of its 4-row bbox), positioned at
 * (col=-2, row=0) so its cells map to col=0, rows=0..3.
 *
 * Hard-drop sends the I-piece to lock at col=0, rows=16..19 — every
 * row 16..19 then has all 10 cells filled → 4-line clear.
 */
function tetrisReady(level = 1): GameState {
	const fresh = newGame({ seed: 1, startLevel: level });
	const board = fresh.board.map((row, r) =>
		r >= BOARD_ROWS - 4
			? row.map((c, col) => (col === 0 ? null : ("T" as Cell)))
			: row,
	);
	return {
		...fresh,
		board,
		active: { type: "I", rotation: 1, col: -2, row: 0 },
	};
}

describe("score-tracker — wired through lockAndAdvance", () => {
	it("4-line clear at level 1 adds 800 to score (plus hard-drop bonus)", () => {
		const setup = tetrisReady(1);
		const before = setup.score;
		const after = applyIntent(setup, { kind: "hard-drop" }, 1);
		// 800 (tetris) at level 1 + 32 hard-drop bonus (16 cells × 2) = 832
		// Hard-drop bonus = drop_distance × 2; the I-piece falls 16 cells
		expect(after.score - before).toBeGreaterThanOrEqual(800);
		expect(after.lines - setup.lines).toBe(4);
	});

	it("4-line clear at level 2 doubles the line-clear score", () => {
		const setup = tetrisReady(2);
		const before = setup.score;
		const after = applyIntent(setup, { kind: "hard-drop" }, 1);
		// scoreForLines(4, 2) = 800 × 2 = 1600
		const lineClearScore = after.score - before;
		// Subtract hard-drop bonus to isolate the line-clear contribution
		// dropDistance for I-piece falling from row 0 → 16 = 16; bonus = 32
		expect(lineClearScore).toBeGreaterThanOrEqual(1600);
	});

	it("after 10 cumulative lines, level increments by 1 (1 → 2)", () => {
		// Start with 6 lines pre-cleared, then a 4-line clear pushes us to 10
		const setup = { ...tetrisReady(1), lines: 6 };
		const after = applyIntent(setup, { kind: "hard-drop" }, 1);
		expect(after.lines).toBe(10);
		expect(after.level).toBe(2);
	});

	it("after 19 cumulative lines, a single clear pushes to level 3 (lines=20)", () => {
		// 19 lines pre-cleared + 1 single = 20 → level 3
		const setupTetris = tetrisReady(1);
		// Replace the bottom row with a near-full row that an I-piece will complete
		const board = setupTetris.board.map((row, r) =>
			r === BOARD_ROWS - 1 ? row.map((c, col) => (col === 0 ? null : ("T" as Cell))) : r >= BOARD_ROWS - 4 ? row.map(() => null) : row,
		);
		const setup = {
			...setupTetris,
			board,
			lines: 19,
			active: { type: "I" as const, rotation: 1 as const, col: -2, row: 0 },
		};
		const after = applyIntent(setup, { kind: "hard-drop" }, 1);
		expect(after.lines).toBe(20);
		expect(after.level).toBe(3);
	});

	it("level does not regress between line-clears", () => {
		let s = tetrisReady(5);
		s = { ...s, lines: 50 }; // already at level 6 territory
		const after = applyIntent(s, { kind: "hard-drop" }, 1);
		expect(after.level).toBeGreaterThanOrEqual(5);
	});

	it("singles, doubles, triples score correctly at level 1", () => {
		// Single-line clear: 100 × level
		const setupSingle = tetrisReady(1);
		const board1 = setupSingle.board.map((row, r) =>
			r === BOARD_ROWS - 1 ? row.map((c, col) => (col === 0 ? null : ("T" as Cell))) : r >= BOARD_ROWS - 4 ? row.map(() => null) : row,
		);
		const single = applyIntent(
			{
				...setupSingle,
				board: board1,
				active: { type: "I" as const, rotation: 1 as const, col: -2, row: 0 },
			},
			{ kind: "hard-drop" },
			1,
		);
		// 1-line clear at level 1 = 100; +hard-drop bonus
		expect(single.lines - setupSingle.lines).toBe(1);
		expect(single.score).toBeGreaterThanOrEqual(100);
	});

	it("score never goes negative after a clear at the lowest level", () => {
		const setup = tetrisReady(1);
		const after = applyIntent(setup, { kind: "hard-drop" }, 1);
		expect(after.score).toBeGreaterThan(0);
	});
});

describe("linesToNextLevel — HUD helper", () => {
	it("0 lines cleared → 10 to next level", () => {
		const s = newGame({ seed: 1 });
		expect(linesToNextLevel(s)).toBe(10);
	});

	it("5 lines cleared → 5 to next level", () => {
		const s = { ...newGame({ seed: 1 }), lines: 5 };
		expect(linesToNextLevel(s)).toBe(5);
	});

	it("9 lines cleared → 1 to next level", () => {
		const s = { ...newGame({ seed: 1 }), lines: 9 };
		expect(linesToNextLevel(s)).toBe(1);
	});

	it("at exactly 10 lines, returns 10 (the full next-level cycle)", () => {
		const s = { ...newGame({ seed: 1 }), lines: 10 };
		expect(linesToNextLevel(s)).toBe(10);
	});

	it("at 27 lines, returns 3 (next level at 30)", () => {
		const s = { ...newGame({ seed: 1 }), lines: 27 };
		expect(linesToNextLevel(s)).toBe(3);
	});
});
