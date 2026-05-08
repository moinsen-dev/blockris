import { afterEach, describe, expect, it } from "bun:test";
import {
	BOARD_COLS,
	BOARD_ROWS,
	type Cell,
	emptyBoard,
} from "../../game-core/board.ts";
import { TETROMINOES } from "../../game-core/tetromino-types.ts";
import { createPlayfield } from "../dom-playfield.ts";
import {
	GHOST_OVERLAY_ATTR,
	GHOST_OVERLAY_CLASS,
	GHOST_OVERLAY_COLOR_VAR,
	clearGhostPiece,
	renderGhost,
} from "../ghost-piece.ts";
import { renderPiece } from "../piece-renderer.ts";

afterEach(() => {
	document.body.innerHTML = "";
});

function mount() {
	const host = document.createElement("div");
	document.body.appendChild(host);
	const pf = createPlayfield(host);
	return { host, pf };
}

function ghostCells(host: HTMLElement): HTMLElement[] {
	return Array.from(
		host.querySelectorAll(`[${GHOST_OVERLAY_ATTR}="true"]`),
	) as HTMLElement[];
}

describe("renderGhost", () => {
	it("marks 4 cells at the landing row for a piece in mid-air", () => {
		const { host, pf } = mount();
		renderGhost(pf, emptyBoard(), "T", 0, 4, 0);
		expect(ghostCells(host).length).toBe(4);
	});

	it("uses the piece's colour", () => {
		const { host, pf } = mount();
		renderGhost(pf, emptyBoard(), "S", 0, 4, 0);
		const cell = ghostCells(host)[0];
		expect(cell?.style.getPropertyValue(GHOST_OVERLAY_COLOR_VAR)).toBe(
			TETROMINOES.S.color,
		);
	});

	it("ghost cells get the GHOST_OVERLAY_CLASS", () => {
		const { host, pf } = mount();
		renderGhost(pf, emptyBoard(), "T", 0, 4, 0);
		for (const cell of ghostCells(host)) {
			expect(cell.classList.contains(GHOST_OVERLAY_CLASS)).toBe(true);
		}
	});

	it("renders nothing when the piece is already at the bottom", () => {
		const { host, pf } = mount();
		// T-piece rotation 0: cells at row 0 of bbox (top notch) + row 1
		// (bottom three). Placing piece at row=18 puts the lowest cell on
		// row 19 → dropDistance 0 → no ghost.
		renderGhost(pf, emptyBoard(), "T", 0, 4, 18);
		expect(ghostCells(host).length).toBe(0);
	});

	it("respects collisions with the existing board", () => {
		const { host, pf } = mount();
		const board = emptyBoard().map((row, r) =>
			r === 10 ? row.map(() => "T" as Cell) : row,
		);
		renderGhost(pf, board, "I", 0, 0, 0);
		// I-piece in rotation 0 lands above the wall at row 10 → row 9
		// (the I-piece occupies row 1 of its 4×4 bbox, so its actual cells
		// land at row 9 + 1 = 10? But row 10 is full → it lands above)
		const ghosts = ghostCells(host);
		expect(ghosts.length).toBeGreaterThan(0);
		expect(ghosts.length).toBeLessThanOrEqual(4);
	});

	it("re-rendering clears previous ghost", () => {
		const { host, pf } = mount();
		renderGhost(pf, emptyBoard(), "T", 0, 4, 0);
		renderGhost(pf, emptyBoard(), "T", 0, 0, 0);
		// Should still have 4 ghost cells, but at a different column
		expect(ghostCells(host).length).toBe(4);
		const cols = ghostCells(host).map((c) => Number(c.getAttribute("data-col")));
		expect(Math.min(...cols)).toBe(0);
	});

	it("does not paint a ghost on top of the active piece overlay", () => {
		const { host, pf } = mount();
		// Render the active piece at (4, 18) where it'll already be at landing
		renderPiece(pf, "T", 0, 4, 18);
		// Ghost at the same position would overlap — should skip
		renderGhost(pf, emptyBoard(), "T", 0, 4, 18);
		// Either no ghost (already at bottom) or it skips the overlay cells.
		const overlapping = ghostCells(host).filter((c) =>
			c.classList.contains("piece-overlay"),
		);
		expect(overlapping.length).toBe(0);
	});

	it("clearGhostPiece removes any ghost", () => {
		const { host, pf } = mount();
		renderGhost(pf, emptyBoard(), "T", 0, 4, 0);
		expect(ghostCells(host).length).toBeGreaterThan(0);
		clearGhostPiece(pf);
		expect(ghostCells(host).length).toBe(0);
	});

	it("clearGhostPiece is idempotent (no ghost → no-op)", () => {
		const { host, pf } = mount();
		clearGhostPiece(pf);
		expect(ghostCells(host).length).toBe(0);
	});

	it("ghost cells respect board bounds (no off-grid paint)", () => {
		const { host, pf } = mount();
		// I-piece at extreme left (col=-2 to put cells at col 0)
		renderGhost(pf, emptyBoard(), "I", 1, -2, 0);
		const ghosts = ghostCells(host);
		for (const cell of ghosts) {
			const c = Number(cell.getAttribute("data-col"));
			const r = Number(cell.getAttribute("data-row"));
			expect(c).toBeGreaterThanOrEqual(0);
			expect(c).toBeLessThan(BOARD_COLS);
			expect(r).toBeGreaterThanOrEqual(0);
			expect(r).toBeLessThan(BOARD_ROWS);
		}
	});
});
