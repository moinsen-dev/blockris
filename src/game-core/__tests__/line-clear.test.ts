import { describe, expect, test } from "bun:test";
import {
	BOARD_COLS,
	BOARD_ROWS,
	emptyBoard,
	type Board,
	type Cell,
} from "../board.ts";
import { clearAndCollapse, detectFullRows } from "../line-clear.ts";

/** Build a board where specific rows are completely filled with type T. */
function fillRows(rows: ReadonlyArray<number>, marker: "I" = "I"): Board {
	return Array.from({ length: BOARD_ROWS }, (_, r) =>
		rows.includes(r)
			? Array.from({ length: BOARD_COLS }, () => marker as Cell)
			: Array.from({ length: BOARD_COLS }, () => null as Cell),
	);
}

describe("detectFullRows", () => {
	test("empty board → no full rows", () => {
		expect(detectFullRows(emptyBoard())).toEqual([]);
	});

	test("single full bottom row detected", () => {
		expect(detectFullRows(fillRows([19]))).toEqual([19]);
	});

	test("multiple non-contiguous full rows", () => {
		expect(detectFullRows(fillRows([5, 12, 19]))).toEqual([5, 12, 19]);
	});

	test("partially-filled row is not detected", () => {
		const b = emptyBoard().map((row) => [...row]);
		// fill cols 0..8 of row 19 — col 9 stays null
		for (let c = 0; c < 9; c++) b[19]![c] = "T";
		expect(detectFullRows(b)).toEqual([]);
	});
});

describe("clearAndCollapse — AC1: 1/2/3/4-row clears return correct count", () => {
	test("single (1-row clear)", () => {
		const before = fillRows([19]);
		const after = clearAndCollapse(before);
		expect(after.count).toBe(1);
		expect(after.clearedRowIndices).toEqual([19]);
	});

	test("double (2-row clear)", () => {
		const after = clearAndCollapse(fillRows([18, 19]));
		expect(after.count).toBe(2);
	});

	test("triple (3-row clear)", () => {
		const after = clearAndCollapse(fillRows([17, 18, 19]));
		expect(after.count).toBe(3);
	});

	test("tetris (4-row clear)", () => {
		const after = clearAndCollapse(fillRows([16, 17, 18, 19]));
		expect(after.count).toBe(4);
	});

	test("zero clears returns same board reference (no-op fast path)", () => {
		const b = emptyBoard();
		const after = clearAndCollapse(b);
		expect(after.count).toBe(0);
		expect(after.board).toBe(b);
	});
});

describe("clearAndCollapse — AC2: cells above cleared rows shift down deterministically", () => {
	test("survivor row above a cleared row drops down by exactly 1", () => {
		// Row 18 has a marker cell at col 0; row 19 is full → cleared.
		// After: the marker should be at row 19, row 18 empty.
		const b = emptyBoard().map((row) => [...row]);
		b[18]![0] = "T";
		for (let c = 0; c < BOARD_COLS; c++) b[19]![c] = "I";
		const after = clearAndCollapse(b);
		expect(after.count).toBe(1);
		expect(after.board[19]![0]).toBe("T");
		expect(after.board[18]![0]).toBeNull();
	});

	test("after a tetris, top 4 rows are empty + others drop accordingly", () => {
		// Row 10 has a marker; rows 16-19 are full → cleared.
		// After: marker should be at row 14 (10 + 4 = 14).
		const b = emptyBoard().map((row) => [...row]);
		b[10]![5] = "Z";
		for (let r = 16; r < 20; r++) {
			for (let c = 0; c < BOARD_COLS; c++) b[r]![c] = "I";
		}
		const after = clearAndCollapse(b);
		expect(after.count).toBe(4);
		expect(after.board[14]![5]).toBe("Z");
		expect(after.board[10]![5]).toBeNull();
		// Top 4 rows (0..3) all empty after the shift
		for (let r = 0; r < 4; r++) {
			for (let c = 0; c < BOARD_COLS; c++) {
				expect(after.board[r]![c]).toBeNull();
			}
		}
	});
});
