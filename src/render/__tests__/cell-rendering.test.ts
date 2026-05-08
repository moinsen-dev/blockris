import { describe, expect, test } from "bun:test";
import { emptyBoard, placePiece } from "../../game-core/board.ts";
import { TETROMINOES } from "../../game-core/tetromino-types.ts";
import { applyCellState, renderBoard } from "../cell-rendering.ts";
import { createPlayfield } from "../dom-playfield.ts";

function freshPlayfield() {
	document.body.innerHTML = "";
	const parent = document.createElement("div");
	document.body.appendChild(parent);
	return createPlayfield(parent);
}

describe("renderBoard — AC1: data-filled + CSS background per cell", () => {
	test("empty board renders all cells data-filled=false", () => {
		const pf = freshPlayfield();
		renderBoard(pf, emptyBoard());
		for (const cell of pf.cells) {
			expect(cell.getAttribute("data-filled")).toBe("false");
		}
	});

	test("a placed O-piece paints exactly 4 cells with O's colour", () => {
		const pf = freshPlayfield();
		const board = placePiece(emptyBoard(), "O", 0, 3, 0);
		// O occupies (4,0),(5,0),(4,1),(5,1)
		renderBoard(pf, board);
		const filled = pf.cells.filter(
			(c) => c.getAttribute("data-filled") === "true",
		);
		expect(filled.length).toBe(4);
		for (const c of filled) {
			expect(c.getAttribute("data-tetromino")).toBe("O");
			// happy-dom keeps the hex value as-set; just check it's the O colour
			expect(c.style.background).toBe(TETROMINOES.O.color);
		}
	});

	test("renderBoard with multiple piece types colours each cell correctly", () => {
		const pf = freshPlayfield();
		let board = placePiece(emptyBoard(), "T", 0, 3, 5);
		board = placePiece(board, "I", 0, 3, 10);
		renderBoard(pf, board);
		const filled = pf.cells.filter(
			(c) => c.getAttribute("data-filled") === "true",
		);
		expect(filled.length).toBe(8); // T (4 cells) + I (4 cells)
		const tCells = filled.filter((c) => c.getAttribute("data-tetromino") === "T");
		const iCells = filled.filter((c) => c.getAttribute("data-tetromino") === "I");
		expect(tCells.length).toBe(4);
		expect(iCells.length).toBe(4);
	});
});

describe("renderBoard — AC2: empty cells have no background-color set", () => {
	test("empty cells reset background to empty string", () => {
		const pf = freshPlayfield();
		// Paint then unpaint
		const board1 = placePiece(emptyBoard(), "T", 0, 3, 5);
		renderBoard(pf, board1);
		renderBoard(pf, emptyBoard());
		const occupied = pf.cells.filter((c) => c.style.background !== "");
		expect(occupied.length).toBe(0);
	});
});

describe("renderBoard — AC3: idempotent (re-render is no-op)", () => {
	test("two consecutive renders of the same board don't change cell.style.background mid-pass", () => {
		const pf = freshPlayfield();
		const board = placePiece(emptyBoard(), "Z", 0, 3, 5);
		renderBoard(pf, board);
		// snapshot
		const before = pf.cells.map((c) => ({
			filled: c.getAttribute("data-filled"),
			type: c.getAttribute("data-tetromino"),
			bg: c.style.background,
		}));
		renderBoard(pf, board);
		const after = pf.cells.map((c) => ({
			filled: c.getAttribute("data-filled"),
			type: c.getAttribute("data-tetromino"),
			bg: c.style.background,
		}));
		expect(after).toEqual(before);
	});
});

describe("applyCellState (single-cell helper)", () => {
	test("null clears data-filled + data-tetromino", () => {
		const pf = freshPlayfield();
		const cell = pf.cells[0]!;
		applyCellState(cell, "T");
		expect(cell.getAttribute("data-filled")).toBe("true");
		applyCellState(cell, null);
		expect(cell.getAttribute("data-filled")).toBe("false");
		expect(cell.getAttribute("data-tetromino")).toBeNull();
	});

	test("setting same type twice is a no-op (early-return path covered)", () => {
		const pf = freshPlayfield();
		const cell = pf.cells[0]!;
		applyCellState(cell, "Z");
		const bg1 = cell.style.background;
		applyCellState(cell, "Z");
		expect(cell.style.background).toBe(bg1);
	});

	test("setting different type updates colour", () => {
		const pf = freshPlayfield();
		const cell = pf.cells[0]!;
		applyCellState(cell, "I");
		const iBg = cell.style.background;
		applyCellState(cell, "L");
		expect(cell.style.background).not.toBe(iBg);
		expect(cell.getAttribute("data-tetromino")).toBe("L");
	});

	test("color matches TETROMINOES[type].color", () => {
		const pf = freshPlayfield();
		const cell = pf.cells[0]!;
		applyCellState(cell, "T");
		// happy-dom preserves the hex value as-set (no rgb() normalisation)
		expect(cell.style.background).toBe(TETROMINOES.T.color);
		expect(TETROMINOES.T.color).toBe("#c084fc");
	});
});
