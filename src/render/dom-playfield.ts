/**
 * DOM playfield — 10×20 CSS-grid of cell elements.
 *
 * Pure structure. No piece-rendering, no colours, no animation.
 * Consumed by:
 * - cell-rendering: paints each cell from a Board state
 * - piece-renderer: overlays the active piece
 * - motion-* tasks: animates DOM nodes via motion.dev
 *
 * Exposes a stable cell-lookup (`getCell(col, row)`) so consumers
 * don't repeatedly query the DOM.
 */

import { BOARD_COLS, BOARD_ROWS } from "../game-core/board.ts";

export interface Playfield {
	readonly root: HTMLElement;
	/** Row-major flat array; length 200. */
	readonly cells: ReadonlyArray<HTMLElement>;
	getCell(col: number, row: number): HTMLElement | null;
}

const CSS_VAR_CELL = "--tetris-cell-px";
const DEFAULT_CELL_PX = 30;

/**
 * Mount a fresh playfield as a child of `parent`. The parent's owner
 * document is used so happy-dom-backed tests work without any
 * special wiring.
 */
export function createPlayfield(
	parent: HTMLElement,
	opts: { cellPx?: number } = {},
): Playfield {
	const doc = parent.ownerDocument;
	const cellPx = opts.cellPx ?? DEFAULT_CELL_PX;

	const root = doc.createElement("div");
	root.setAttribute("data-playfield", "true");
	root.style.display = "grid";
	root.style.gridTemplateColumns = `repeat(${BOARD_COLS}, var(${CSS_VAR_CELL}, ${cellPx}px))`;
	root.style.gridTemplateRows = `repeat(${BOARD_ROWS}, var(${CSS_VAR_CELL}, ${cellPx}px))`;
	root.style.gap = "1px";
	root.style.background = "#1f2937"; // grid-line colour
	root.style.padding = "1px";
	root.style.width = "fit-content";

	const cells: HTMLElement[] = [];
	for (let r = 0; r < BOARD_ROWS; r++) {
		for (let c = 0; c < BOARD_COLS; c++) {
			const cell = doc.createElement("div");
			cell.setAttribute("data-col", String(c));
			cell.setAttribute("data-row", String(r));
			cell.setAttribute("data-filled", "false");
			cell.style.background = "#0f172a"; // empty-cell colour
			root.appendChild(cell);
			cells.push(cell);
		}
	}

	parent.appendChild(root);

	const getCell = (col: number, row: number): HTMLElement | null => {
		if (col < 0 || col >= BOARD_COLS) return null;
		if (row < 0 || row >= BOARD_ROWS) return null;
		return cells[row * BOARD_COLS + col] ?? null;
	};

	return { root, cells, getCell };
}
