import { afterEach, describe, expect, it } from "bun:test";
import {
	BOARD_COLS,
	BOARD_ROWS,
	emptyBoard,
} from "../../game-core/board.ts";
import {
	TETROMINOES,
	shapeOf,
} from "../../game-core/tetromino-types.ts";
import { renderBoard } from "../cell-rendering.ts";
import { createPlayfield } from "../dom-playfield.ts";
import {
	PIECE_OVERLAY_CLASS,
	PIECE_OVERLAY_COLOR_VAR,
	PIECE_OVERLAY_TYPE_ATTR,
	clearPieceOverlay,
	renderPiece,
} from "../piece-renderer.ts";

function mount() {
	const host = document.createElement("div");
	document.body.appendChild(host);
	const pf = createPlayfield(host);
	return { host, pf };
}

afterEach(() => {
	document.body.innerHTML = "";
});

function overlayCells(host: HTMLElement): HTMLElement[] {
	return Array.from(
		host.querySelectorAll(`.${PIECE_OVERLAY_CLASS}`),
	) as HTMLElement[];
}

describe("renderPiece", () => {
	it("marks exactly 4 cells as piece-overlay", () => {
		const { host, pf } = mount();
		renderPiece(pf, "T", 0, 4, 5);
		expect(overlayCells(host).length).toBe(4);
	});

	it("marks the cells matching shapeOf(type, rotation)", () => {
		const { pf } = mount();
		renderPiece(pf, "L", 0, 3, 5);
		const expected = shapeOf("L", 0).map(([dCol, dRow]) => `${3 + dCol},${5 + dRow}`);
		const actual: string[] = [];
		for (let r = 0; r < BOARD_ROWS; r++) {
			for (let c = 0; c < BOARD_COLS; c++) {
				const el = pf.getCell(c, r);
				if (el?.classList.contains(PIECE_OVERLAY_CLASS)) {
					actual.push(`${c},${r}`);
				}
			}
		}
		expect(actual.sort()).toEqual(expected.sort());
	});

	it("stamps data-overlay-type with the piece type", () => {
		const { host, pf } = mount();
		renderPiece(pf, "T", 0, 4, 0);
		for (const el of overlayCells(host)) {
			expect(el.getAttribute(PIECE_OVERLAY_TYPE_ATTR)).toBe("T");
		}
	});

	it("paints --piece-color CSS variable with the type's color", () => {
		const { host, pf } = mount();
		renderPiece(pf, "S", 0, 4, 0);
		const expectedColor = TETROMINOES.S.color;
		for (const el of overlayCells(host)) {
			expect(el.style.getPropertyValue(PIECE_OVERLAY_COLOR_VAR)).toBe(
				expectedColor,
			);
		}
	});

	it("clears the previous overlay when called again", () => {
		const { host, pf } = mount();
		renderPiece(pf, "T", 0, 4, 0);
		const first = overlayCells(host).map((el) => el.getAttribute(PIECE_OVERLAY_TYPE_ATTR));
		expect(first.length).toBe(4);
		renderPiece(pf, "T", 0, 4, 5);
		const second = overlayCells(host);
		// Still exactly 4 marked (only the new position)
		expect(second.length).toBe(4);
	});

	it("re-rendering at a different position leaves no stale overlays", () => {
		const { host, pf } = mount();
		renderPiece(pf, "T", 0, 0, 0);
		renderPiece(pf, "T", 0, 7, 15);
		// The cells around (0,0) should no longer be overlay-marked
		for (let dCol = 0; dCol < 4; dCol++) {
			for (let dRow = 0; dRow < 4; dRow++) {
				const cell = pf.getCell(dCol, dRow);
				if (cell?.classList.contains(PIECE_OVERLAY_CLASS)) {
					// must be inside (7,15)..(10,18) bbox, not at (0,0)
					throw new Error(
						`stale overlay at (${dCol},${dRow}) after move`,
					);
				}
			}
		}
		// New position has 4 overlays
		expect(overlayCells(host).length).toBe(4);
	});

	it("re-rendering with a DIFFERENT type swaps the data-overlay-type attribute", () => {
		const { host, pf } = mount();
		renderPiece(pf, "T", 0, 4, 5);
		renderPiece(pf, "S", 0, 4, 5);
		for (const el of overlayCells(host)) {
			expect(el.getAttribute(PIECE_OVERLAY_TYPE_ATTR)).toBe("S");
		}
	});

	it("is rotation-aware", () => {
		const { pf } = mount();
		renderPiece(pf, "L", 0, 3, 5);
		const rotation0Cells = shapeOf("L", 0).map(
			([dCol, dRow]) => `${3 + dCol},${5 + dRow}`,
		);
		renderPiece(pf, "L", 1, 3, 5);
		const rotation1Cells = shapeOf("L", 1).map(
			([dCol, dRow]) => `${3 + dCol},${5 + dRow}`,
		);
		expect(rotation0Cells).not.toEqual(rotation1Cells);
	});

	it("silently skips off-board cells (negative col or row >= board)", () => {
		const { host, pf } = mount();
		// Render an I-piece (4-wide) so far left it has cells at negative col
		renderPiece(pf, "I", 0, -2, 5);
		// Some cells render, others off-board are skipped — never crashes
		expect(overlayCells(host).length).toBeLessThanOrEqual(4);
		expect(overlayCells(host).length).toBeGreaterThanOrEqual(1);
	});

	it("does NOT clear the underlying board's data-filled state", () => {
		const { host, pf } = mount();
		// Put a locked block on the board
		const board = emptyBoard().map((row, r) =>
			r === 19 ? row.map(() => "T" as const) : row,
		);
		renderBoard(pf, board);
		// Now render a piece overlay above row 19
		renderPiece(pf, "T", 0, 4, 5);
		// Bottom row should still be data-filled=true
		const bottom = pf.getCell(0, 19);
		expect(bottom?.getAttribute("data-filled")).toBe("true");
	});
});

describe("clearPieceOverlay", () => {
	it("removes any active overlay", () => {
		const { host, pf } = mount();
		renderPiece(pf, "T", 0, 4, 5);
		expect(overlayCells(host).length).toBe(4);
		clearPieceOverlay(pf);
		expect(overlayCells(host).length).toBe(0);
	});

	it("is idempotent (no overlay → no-op)", () => {
		const { host, pf } = mount();
		clearPieceOverlay(pf);
		expect(overlayCells(host).length).toBe(0);
	});
});
