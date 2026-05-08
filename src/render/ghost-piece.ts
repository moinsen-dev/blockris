/**
 * Ghost-piece overlay: shows where the active piece will land if
 * hard-dropped right now. Drawn as a translucent outline using the
 * piece's colour, on the SAME cells as `piece-overlay` would mark
 * if the piece were already at that landing row.
 *
 * Distinct attribute (`data-ghost`) + class (`ghost-overlay`) so
 * CSS rules and tests don't clash with the real `piece-overlay`.
 */

import type { Board } from "../game-core/board.ts";
import { dropDistance } from "../game-core/gravity.ts";
import {
	TETROMINOES,
	type Rotation,
	type TetrominoType,
	shapeOf,
} from "../game-core/tetromino-types.ts";
import type { Playfield } from "./dom-playfield.ts";

export const GHOST_OVERLAY_CLASS = "ghost-overlay";
export const GHOST_OVERLAY_ATTR = "data-ghost";
export const GHOST_OVERLAY_COLOR_VAR = "--piece-color";

function clearGhost(playfield: Playfield): void {
	const previous = playfield.root.querySelectorAll(
		`[${GHOST_OVERLAY_ATTR}="true"]`,
	);
	for (const el of Array.from(previous) as HTMLElement[]) {
		el.removeAttribute(GHOST_OVERLAY_ATTR);
		el.classList.remove(GHOST_OVERLAY_CLASS);
		el.style.removeProperty(GHOST_OVERLAY_COLOR_VAR);
	}
}

export function renderGhost(
	playfield: Playfield,
	board: Board,
	type: TetrominoType,
	rotation: Rotation,
	col: number,
	row: number,
): void {
	clearGhost(playfield);
	const distance = dropDistance(board, type, rotation, col, row);
	const landingRow = row + distance;
	if (landingRow === row) return; // Already at the bottom; no ghost.
	const colour = TETROMINOES[type].color;
	for (const [dCol, dRow] of shapeOf(type, rotation)) {
		const c = col + dCol;
		const r = landingRow + dRow;
		const cell = playfield.getCell(c, r);
		// Don't paint a ghost on top of the active piece itself.
		if (!cell) continue;
		if (cell.classList.contains("piece-overlay")) continue;
		cell.classList.add(GHOST_OVERLAY_CLASS);
		cell.setAttribute(GHOST_OVERLAY_ATTR, "true");
		cell.style.setProperty(GHOST_OVERLAY_COLOR_VAR, colour);
	}
}

export function clearGhostPiece(playfield: Playfield): void {
	clearGhost(playfield);
}
