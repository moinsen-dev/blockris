/**
 * Line-clear detection + collapse.
 *
 * Standard Tetris rules:
 * - A row is "full" when every cell is filled.
 * - When ≥1 row is full, those rows are removed and the rows above
 *   shift down by the count cleared. New empty rows appear at the
 *   top.
 * - Line-clear count drives scoring (1/2/3/4 = single/double/triple/
 *   tetris) — see `scoring.ts`.
 *
 * Pure-functional: returns a NEW board + the count.
 */

import {
	BOARD_COLS,
	BOARD_ROWS,
	emptyBoard,
	type Board,
	type Cell,
} from "./board.ts";

export interface LineClearResult {
	/** Board after the cleared rows have been removed and others fallen down. */
	readonly board: Board;
	/** Number of rows cleared (0..4). */
	readonly count: number;
	/** Indices of the rows that were full (top → bottom in the OLD board). */
	readonly clearedRowIndices: ReadonlyArray<number>;
}

/** Find the indices of full rows. Empty array when no clears. */
export function detectFullRows(board: Board): number[] {
	const out: number[] = [];
	for (let r = 0; r < BOARD_ROWS; r++) {
		const row = board[r];
		if (!row) continue;
		let full = true;
		for (let c = 0; c < BOARD_COLS; c++) {
			if (row[c] == null) {
				full = false;
				break;
			}
		}
		if (full) out.push(r);
	}
	return out;
}

/**
 * Clear all full rows and collapse the rest down. Returns a new
 * board + the count of cleared rows.
 *
 * Implementation: copy non-full rows top-to-bottom in their original
 * order, then prepend `count` empty rows at the top.
 */
export function clearAndCollapse(board: Board): LineClearResult {
	const cleared = detectFullRows(board);
	if (cleared.length === 0) {
		return { board, count: 0, clearedRowIndices: [] };
	}
	const fullSet = new Set(cleared);
	const survivors: ReadonlyArray<Cell>[] = [];
	for (let r = 0; r < BOARD_ROWS; r++) {
		if (!fullSet.has(r)) {
			const row = board[r];
			if (row) survivors.push([...row]);
		}
	}
	const empties = emptyBoard().slice(0, cleared.length);
	const next: ReadonlyArray<Cell>[] = [...empties, ...survivors];
	return { board: next, count: cleared.length, clearedRowIndices: cleared };
}
