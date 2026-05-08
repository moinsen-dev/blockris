import { describe, expect, test } from "bun:test";
import { emptyBoard, placePiece } from "../board.ts";
import {
	canMove,
	dropDistance,
	framesPerCell,
	hardDrop,
	msPerCell,
	softDropOne,
} from "../gravity.ts";

describe("framesPerCell — AC2: official guideline curve", () => {
	test("level 0 = 48 frames/cell", () => {
		expect(framesPerCell(0)).toBe(48);
	});

	test("speeds up monotonically through level 9", () => {
		for (let lv = 0; lv < 9; lv++) {
			expect(framesPerCell(lv + 1)).toBeLessThanOrEqual(framesPerCell(lv));
		}
	});

	test("level 9 is significantly faster than level 0 (≥6×)", () => {
		expect(framesPerCell(0) / framesPerCell(9)).toBeGreaterThanOrEqual(6);
	});

	test("level 29+ is 1 frame/cell (20G)", () => {
		expect(framesPerCell(29)).toBe(1);
		expect(framesPerCell(50)).toBe(1);
		expect(framesPerCell(999)).toBe(1);
	});

	test("negative level clamps to level 0", () => {
		expect(framesPerCell(-1)).toBe(48);
	});
});

describe("msPerCell", () => {
	test("level 0 at 60fps ≈ 800ms/cell", () => {
		expect(Math.round(msPerCell(0, 60))).toBe(800);
	});

	test("level 29+ at 60fps ≈ 16.67ms/cell", () => {
		expect(msPerCell(29, 60)).toBeCloseTo(16.67, 1);
	});
});

describe("hardDrop — AC1: lock-position for any piece+board", () => {
	test("hardDrop on empty board: T-piece lands at row 18 (bbox top at row 18 → cells in row 18,19)", () => {
		// T rotation 0 occupies offsets [(1,0),(0,1),(1,1),(2,1)] within bbox.
		// On empty board with col=4, hardDrop should land such that the
		// bottom-most cell of the piece touches row 19.
		// Bottom-most relative row is 1, so piece-bbox-top should be 18.
		const b = emptyBoard();
		expect(hardDrop(b, "T", 0, 4, 0)).toBe(18);
	});

	test("hardDrop on empty board: I horizontal lands at row 18", () => {
		// I rotation 0 has its 4 cells in row 1 of the 4×4 bbox.
		// Bottom-most relative row is 1, so piece-bbox-top should be 18.
		const b = emptyBoard();
		expect(hardDrop(b, "I", 0, 3, 0)).toBe(18);
	});

	test("hardDrop with obstacle stops just above it", () => {
		const b = emptyBoard();
		// Place an O at (3, 18) to block the drop column.
		// O at row 18 fills (4,18),(5,18),(4,19),(5,19).
		const blocked = placePiece(b, "O", 0, 3, 18);
		// Now drop another O above — it should land at row 16 so cells
		// occupy (4,16),(5,16),(4,17),(5,17).
		expect(hardDrop(blocked, "O", 0, 3, 0)).toBe(16);
	});

	test("hardDrop is idempotent — already-resting piece returns same row", () => {
		const b = emptyBoard();
		const dropRow = hardDrop(b, "T", 0, 4, 0);
		expect(hardDrop(b, "T", 0, 4, dropRow)).toBe(dropRow);
	});
});

describe("softDropOne", () => {
	test("returns row+1 when path is clear", () => {
		const b = emptyBoard();
		expect(softDropOne(b, "T", 0, 4, 0)).toBe(1);
	});

	test("returns null when blocked at the floor", () => {
		const b = emptyBoard();
		// drop the T to its lock position first
		const lockRow = hardDrop(b, "T", 0, 4, 0);
		expect(softDropOne(b, "T", 0, 4, lockRow)).toBeNull();
	});
});

describe("dropDistance", () => {
	test("piece at top of empty board has distance = lock-row", () => {
		const b = emptyBoard();
		expect(dropDistance(b, "T", 0, 4, 0)).toBe(18);
	});

	test("piece already at lock-row has distance 0", () => {
		const b = emptyBoard();
		const lock = hardDrop(b, "T", 0, 4, 0);
		expect(dropDistance(b, "T", 0, 4, lock)).toBe(0);
	});
});

describe("canMove", () => {
	test("right-shift at empty board succeeds", () => {
		const b = emptyBoard();
		expect(canMove(b, "T", 0, 4, 5, 1, 0)).toBe(true);
	});

	test("right-shift into wall fails", () => {
		const b = emptyBoard();
		// T bbox is 3 wide (cols 0-2 of bbox); at col 7 cells reach col 9.
		// At col 8 cells would reach col 10 → OOB.
		expect(canMove(b, "T", 0, 7, 5, 1, 0)).toBe(false);
	});
});
