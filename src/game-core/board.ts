/**
 * 10 × 20 Tetris playfield.
 *
 * Convention:
 * - Row 0 is the top of the board, row 19 is the bottom.
 * - Col 0 is the left edge, col 9 is the right.
 * - Cells store the TetrominoType (or `null` when empty); colour is
 *   resolved at render time via TETROMINOES[type].color.
 *
 * Board is treated as immutable — mutators (`placePiece`,
 * `clearRows`) return new boards. Cheap enough at 200 cells.
 */

import { shapeOf, type Rotation, type TetrominoType } from "./tetromino-types.ts";

export const BOARD_COLS = 10;
export const BOARD_ROWS = 20;

export type Cell = TetrominoType | null;
export type Board = ReadonlyArray<ReadonlyArray<Cell>>;

/** Fresh empty board (200 nulls in 20 rows × 10 cols). */
export function emptyBoard(): Board {
	return Array.from({ length: BOARD_ROWS }, () =>
		Array.from({ length: BOARD_COLS }, () => null as Cell),
	);
}

export function isInBounds(col: number, row: number): boolean {
	return col >= 0 && col < BOARD_COLS && row >= 0 && row < BOARD_ROWS;
}

/**
 * Cell-occupied predicate. Out-of-bounds cells count as occupied so
 * `canPlacePiece` rejects pieces hanging off the board edge.
 */
export function isOccupied(board: Board, col: number, row: number): boolean {
	if (!isInBounds(col, row)) return true;
	return board[row]?.[col] != null;
}

/**
 * Compute the 4 absolute cells a piece occupies at a given pivot
 * (col, row) and rotation. Returns `[col, row]` pairs.
 */
export function pieceCells(
	type: TetrominoType,
	rotation: Rotation,
	col: number,
	row: number,
): Array<readonly [number, number]> {
	return shapeOf(type, rotation).map(
		([dc, dr]) => [col + dc, row + dr] as const,
	);
}

/**
 * O(4) collision check — only the piece's own cells are examined.
 * Out-of-bounds cells count as collisions (handled by `isOccupied`).
 */
export function canPlacePiece(
	board: Board,
	type: TetrominoType,
	rotation: Rotation,
	col: number,
	row: number,
): boolean {
	for (const [c, r] of pieceCells(type, rotation, col, row)) {
		if (isOccupied(board, c, r)) return false;
	}
	return true;
}

/**
 * Lock a piece into the board, returning a NEW board. Cells outside
 * the visible playfield are silently dropped (defensive — callers
 * should have collision-checked first).
 */
export function placePiece(
	board: Board,
	type: TetrominoType,
	rotation: Rotation,
	col: number,
	row: number,
): Board {
	const next = board.map((r) => [...r]);
	for (const [c, r] of pieceCells(type, rotation, col, row)) {
		if (isInBounds(c, r)) {
			next[r]![c] = type;
		}
	}
	return next;
}

/**
 * Count filled cells per row — used by `line-clear`. Returns an
 * array of length BOARD_ROWS.
 */
export function rowFillCounts(board: Board): number[] {
	return board.map((row) => row.reduce((acc, c) => acc + (c != null ? 1 : 0), 0));
}

/**
 * Pretty-print the board for terminal debugging. Empty cells are `.`,
 * filled cells use the tetromino letter.
 */
export function debugPrint(board: Board): string {
	return board
		.map((row) => row.map((c) => (c == null ? "." : c)).join(""))
		.join("\n");
}
