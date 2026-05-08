/**
 * Active-piece overlay renderer.
 *
 * The active piece lives ONE LAYER ABOVE the locked board state.
 * `renderBoard` paints locked cells; `renderPiece` paints the
 * currently-falling piece on top. When the piece moves, we clear
 * the previous overlay and paint the new position — the underlying
 * board cells are untouched.
 *
 * Marker: class `piece-overlay` (literal name from the spec) plus
 * inline `--piece-color` CSS variable so the colour comes through
 * without an external stylesheet. Off-board cells (outside the 0..9
 * × 0..19 grid) are silently skipped.
 */

import {
	TETROMINOES,
	type Rotation,
	type TetrominoType,
	shapeOf,
} from "../game-core/tetromino-types.ts";
import type { Playfield } from "./dom-playfield.ts";

export const PIECE_OVERLAY_CLASS = "piece-overlay";
export const PIECE_OVERLAY_TYPE_ATTR = "data-overlay-type";
export const PIECE_OVERLAY_COLOR_VAR = "--piece-color";

function clearOverlay(playfield: Playfield): void {
	const previous = playfield.root.querySelectorAll(
		`.${PIECE_OVERLAY_CLASS}`,
	);
	for (const el of Array.from(previous) as HTMLElement[]) {
		el.classList.remove(PIECE_OVERLAY_CLASS);
		el.removeAttribute(PIECE_OVERLAY_TYPE_ATTR);
		el.style.removeProperty(PIECE_OVERLAY_COLOR_VAR);
	}
}

export function renderPiece(
	playfield: Playfield,
	type: TetrominoType,
	rotation: Rotation,
	col: number,
	row: number,
): void {
	clearOverlay(playfield);
	const colour = TETROMINOES[type].color;
	const offsets = shapeOf(type, rotation);
	for (const [dCol, dRow] of offsets) {
		const cell = playfield.getCell(col + dCol, row + dRow);
		if (cell) {
			cell.classList.add(PIECE_OVERLAY_CLASS);
			cell.setAttribute(PIECE_OVERLAY_TYPE_ATTR, type);
			cell.style.setProperty(PIECE_OVERLAY_COLOR_VAR, colour);
		}
	}
}

/** Convenience: clear any current overlay (e.g. on lock or game-over). */
export function clearPieceOverlay(playfield: Playfield): void {
	clearOverlay(playfield);
}
