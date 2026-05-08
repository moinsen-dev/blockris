import { describe, expect, test } from "bun:test";
import {
	BOARD_COLS,
	BOARD_ROWS,
	canPlacePiece,
	debugPrint,
	emptyBoard,
	isInBounds,
	isOccupied,
	pieceCells,
	placePiece,
	rowFillCounts,
} from "../board.ts";

describe("board dimensions — AC1: 10 cols × 20 rows", () => {
	test("constants", () => {
		expect(BOARD_COLS).toBe(10);
		expect(BOARD_ROWS).toBe(20);
	});

	test("emptyBoard has 20 rows of 10 nulls", () => {
		const b = emptyBoard();
		expect(b.length).toBe(20);
		for (const row of b) {
			expect(row.length).toBe(10);
			for (const cell of row) expect(cell).toBeNull();
		}
	});
});

describe("isInBounds + isOccupied — AC2: O(piece-cell-count) checks", () => {
	test("isInBounds at corners", () => {
		expect(isInBounds(0, 0)).toBe(true);
		expect(isInBounds(9, 19)).toBe(true);
		expect(isInBounds(-1, 0)).toBe(false);
		expect(isInBounds(10, 0)).toBe(false);
		expect(isInBounds(0, 20)).toBe(false);
	});

	test("isOccupied: empty cell → false, OOB → true", () => {
		const b = emptyBoard();
		expect(isOccupied(b, 5, 5)).toBe(false);
		expect(isOccupied(b, -1, 0)).toBe(true);
		expect(isOccupied(b, 0, 20)).toBe(true);
	});
});

describe("pieceCells", () => {
	test("T at (4, 0) rotation 0 occupies the canonical 4 cells", () => {
		const cells = pieceCells("T", 0, 4, 0);
		expect(cells).toEqual([
			[5, 0],
			[4, 1],
			[5, 1],
			[6, 1],
		]);
	});

	test("O at (3, 0) rotation 0", () => {
		const cells = pieceCells("O", 0, 3, 0);
		// O shape relative offsets: [1,0],[2,0],[1,1],[2,1]
		expect(cells).toEqual([
			[4, 0],
			[5, 0],
			[4, 1],
			[5, 1],
		]);
	});
});

describe("canPlacePiece + placePiece", () => {
	test("placePiece on empty board fills exactly 4 cells", () => {
		const b = emptyBoard();
		const next = placePiece(b, "T", 0, 4, 0);
		const filled = next.flat().filter((c) => c != null);
		expect(filled.length).toBe(4);
	});

	test("placePiece does NOT mutate the input board (immutability)", () => {
		const b = emptyBoard();
		placePiece(b, "T", 0, 4, 0);
		// Original still all nulls
		const allNull = b.every((row) => row.every((c) => c == null));
		expect(allNull).toBe(true);
	});

	test("canPlacePiece at edge returns false (OOB)", () => {
		const b = emptyBoard();
		// I rotation 0 spans cols 0-3, so col=-1 puts it OOB
		expect(canPlacePiece(b, "I", 0, -1, 0)).toBe(false);
	});

	test("canPlacePiece sees existing occupied cells as collision", () => {
		const b = emptyBoard();
		const filled = placePiece(b, "O", 0, 3, 0);
		// O occupies (4,0),(5,0),(4,1),(5,1). T at (4,0) shape includes (5,0),(4,1),(5,1),(6,1) — overlaps.
		expect(canPlacePiece(filled, "T", 0, 4, 0)).toBe(false);
	});

	test("canPlacePiece allows a piece at a non-overlapping position", () => {
		const b = emptyBoard();
		const filled = placePiece(b, "O", 0, 3, 0);
		// O on the right side
		expect(canPlacePiece(filled, "O", 0, 6, 0)).toBe(true);
	});
});

describe("rowFillCounts", () => {
	test("empty board has zero counts everywhere", () => {
		const b = emptyBoard();
		expect(rowFillCounts(b)).toEqual(new Array(20).fill(0));
	});

	test("counts increment per filled cell in row", () => {
		const b = emptyBoard();
		// Place an O — fills 2 cells in row 0 + 2 in row 1
		const next = placePiece(b, "O", 0, 3, 0);
		const counts = rowFillCounts(next);
		expect(counts[0]).toBe(2);
		expect(counts[1]).toBe(2);
		expect(counts[2]).toBe(0);
	});
});

describe("debugPrint", () => {
	test("empty board renders as 20 lines of 10 dots", () => {
		const out = debugPrint(emptyBoard());
		const lines = out.split("\n");
		expect(lines.length).toBe(20);
		for (const line of lines) expect(line).toBe("..........");
	});
});
