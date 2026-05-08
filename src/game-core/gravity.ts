/**
 * Gravity, soft-drop, and hard-drop logic.
 *
 * Per the Tetris guideline 2009 gravity table (frames-per-cell at
 * 60fps). Level 0 ≈ 0.8s per cell, level 9 ≈ 0.1s, level 29+ is
 * effectively "20G" (1 frame per cell — pieces snap straight down).
 *
 * - `framesPerCell(level)` → consumer's tick-loop converts to ms.
 * - `softDropOne` → standard down-arrow nudge.
 * - `hardDrop` → space-bar lock-down: returns the bottom-most legal
 *   row for the given piece. Caller pairs this with `placePiece`.
 */

import { canPlacePiece, type Board } from "./board.ts";
import type { Rotation, TetrominoType } from "./tetromino-types.ts";

/**
 * Frames-per-cell at 60 fps. Indexed by level. After level 29 we
 * stay at 1 (20G — "lock-on-spawn" at extreme levels).
 */
const GRAVITY_TABLE: ReadonlyArray<number> = [
	48, 43, 38, 33, 28, 23, 18, 13, 8, 6, // 0–9
	5, 5, 5, 4, 4, 4, 3, 3, 3, 2,         // 10–19
	2, 2, 2, 2, 2, 2, 2, 2, 2,             // 20–28
	1,                                     // 29+
];

export function framesPerCell(level: number): number {
	if (level < 0) return GRAVITY_TABLE[0] ?? 48;
	if (level >= GRAVITY_TABLE.length) return 1;
	return GRAVITY_TABLE[level] as number;
}

/** Convert frames-per-cell to ms-per-cell at a given fps (default 60). */
export function msPerCell(level: number, fps = 60): number {
	return (framesPerCell(level) * 1000) / fps;
}

/**
 * Try to translate the piece by (dCol, dRow). Returns true if the
 * destination is free. Pure check — does not mutate the board.
 */
export function canMove(
	board: Board,
	type: TetrominoType,
	rotation: Rotation,
	col: number,
	row: number,
	dCol: number,
	dRow: number,
): boolean {
	return canPlacePiece(board, type, rotation, col + dCol, row + dRow);
}

/**
 * Soft-drop the piece by one cell. Returns the new row or `null` if
 * blocked (caller should lock the piece on `null`).
 */
export function softDropOne(
	board: Board,
	type: TetrominoType,
	rotation: Rotation,
	col: number,
	row: number,
): number | null {
	if (canMove(board, type, rotation, col, row, 0, 1)) return row + 1;
	return null;
}

/**
 * Hard-drop: returns the lowest legal row for the piece. Idempotent
 * if the piece is already resting on a surface.
 */
export function hardDrop(
	board: Board,
	type: TetrominoType,
	rotation: Rotation,
	col: number,
	row: number,
): number {
	let r = row;
	while (canMove(board, type, rotation, col, r, 0, 1)) {
		r += 1;
	}
	return r;
}

/** Number of cells the piece would fall on a hard-drop from its current row. */
export function dropDistance(
	board: Board,
	type: TetrominoType,
	rotation: Rotation,
	col: number,
	row: number,
): number {
	return hardDrop(board, type, rotation, col, row) - row;
}
