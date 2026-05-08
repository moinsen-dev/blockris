/**
 * Queue preview HUD: renders the next N upcoming pieces from the
 * bag-queue. Each preview is a tiny 4×4 grid with the tetromino
 * shape painted using the piece's colour.
 */

import {
	TETROMINOES,
	shapeOf,
	type TetrominoType,
} from "../game-core/tetromino-types.ts";

export const MINI_CELL_CLASS = "blockris-mini";
export const MINI_FILLED_ATTR = "data-mini-filled";
export const MINI_COLOR_VAR = "--mini-color";

export interface QueuePreview {
	readonly root: HTMLElement;
	readonly slots: ReadonlyArray<HTMLElement>;
}

function buildSlot(doc: Document): HTMLElement {
	const slot = doc.createElement("div");
	slot.classList.add(MINI_CELL_CLASS);
	for (let i = 0; i < 16; i++) {
		const cell = doc.createElement("div");
		slot.appendChild(cell);
	}
	return slot;
}

export function createQueuePreview(
	parent: HTMLElement,
	count = 5,
): QueuePreview {
	const doc = parent.ownerDocument;
	const root = doc.createElement("div");
	root.classList.add("blockris-side");
	root.setAttribute("data-slot", "queue");
	const heading = doc.createElement("h3");
	heading.textContent = "Next";
	root.appendChild(heading);
	const slots: HTMLElement[] = [];
	for (let i = 0; i < count; i++) {
		const slot = buildSlot(doc);
		root.appendChild(slot);
		slots.push(slot);
	}
	parent.appendChild(root);
	return { root, slots };
}

function clearSlot(slot: HTMLElement): void {
	for (const cell of Array.from(slot.children) as HTMLElement[]) {
		cell.removeAttribute(MINI_FILLED_ATTR);
		cell.style.removeProperty(MINI_COLOR_VAR);
	}
}

function paintSlot(slot: HTMLElement, type: TetrominoType): void {
	clearSlot(slot);
	const colour = TETROMINOES[type].color;
	const offsets = shapeOf(type, 0);
	for (const [dCol, dRow] of offsets) {
		// Centre the 4×4 shape inside the 4×4 slot. Most pieces fit
		// directly; the I-piece is row 1, the rest occupy a 3×3 bbox
		// in the top-left so they look fine without explicit centring.
		const idx = dRow * 4 + dCol;
		const cell = slot.children[idx] as HTMLElement | undefined;
		if (cell) {
			cell.setAttribute(MINI_FILLED_ATTR, "true");
			cell.style.setProperty(MINI_COLOR_VAR, colour);
		}
	}
}

export function paintQueue(
	preview: QueuePreview,
	pieces: ReadonlyArray<TetrominoType>,
): void {
	for (let i = 0; i < preview.slots.length; i++) {
		const slot = preview.slots[i];
		if (!slot) continue;
		const type = pieces[i];
		if (type) {
			paintSlot(slot, type);
		} else {
			clearSlot(slot);
		}
	}
}
