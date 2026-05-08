/**
 * Paint a Board onto a Playfield.
 *
 * Pure function (apart from DOM mutation): given a Playfield and a
 * Board, sync each cell's background and data-filled. No animation
 * here — that's motion-* tasks.
 *
 * Idempotent: re-rendering the same board produces no observable
 * change (already-correct cells skip the assignment).
 */

import type { Board } from "../game-core/board.ts";
import { TETROMINOES, type TetrominoType } from "../game-core/tetromino-types.ts";
import type { Playfield } from "./dom-playfield.ts";

const EMPTY_BG = "rgb(15, 23, 42)"; // matches default in dom-playfield

export function renderBoard(playfield: Playfield, board: Board): void {
	for (let r = 0; r < board.length; r++) {
		const row = board[r];
		if (!row) continue;
		for (let c = 0; c < row.length; c++) {
			const cellEl = playfield.getCell(c, r);
			if (!cellEl) continue;
			const type = row[c];
			applyCellState(cellEl, type as TetrominoType | null);
		}
	}
}

/**
 * Set a single cell's visual state. Exported so the piece-renderer
 * (overlay) and motion-* (animations) can re-use it.
 */
export function applyCellState(
	cellEl: HTMLElement,
	type: TetrominoType | null,
): void {
	if (type == null) {
		const filled = cellEl.getAttribute("data-filled");
		if (filled === "false" && !cellEl.style.background) return; // already empty
		cellEl.setAttribute("data-filled", "false");
		cellEl.style.background = "";
		cellEl.removeAttribute("data-tetromino");
		return;
	}
	const colour = TETROMINOES[type].color;
	const existingType = cellEl.getAttribute("data-tetromino");
	if (existingType === type && cellEl.getAttribute("data-filled") === "true") {
		return; // already painted with this type
	}
	cellEl.setAttribute("data-filled", "true");
	cellEl.setAttribute("data-tetromino", type);
	cellEl.style.background = colour;
}
