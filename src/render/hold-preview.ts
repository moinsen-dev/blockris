/**
 * Hold-piece preview HUD: a single 4×4 mini-grid showing the
 * currently held piece (or empty if `hold === null`). Visually
 * matches the queue-preview slots.
 */

import {
	TETROMINOES,
	shapeOf,
	type TetrominoType,
} from "../game-core/tetromino-types.ts";
import {
	MINI_CELL_CLASS,
	MINI_COLOR_VAR,
	MINI_FILLED_ATTR,
} from "./queue-preview.ts";

export interface HoldPreview {
	readonly root: HTMLElement;
	readonly slot: HTMLElement;
}

function buildSlot(doc: Document): HTMLElement {
	const slot = doc.createElement("div");
	slot.classList.add(MINI_CELL_CLASS);
	for (let i = 0; i < 16; i++) {
		slot.appendChild(doc.createElement("div"));
	}
	return slot;
}

export function createHoldPreview(parent: HTMLElement): HoldPreview {
	const doc = parent.ownerDocument;
	const root = doc.createElement("div");
	root.classList.add("tetris-side");
	root.setAttribute("data-slot", "hold");
	const heading = doc.createElement("h3");
	heading.textContent = "Hold";
	root.appendChild(heading);
	const slot = buildSlot(doc);
	root.appendChild(slot);
	parent.appendChild(root);
	return { root, slot };
}

function clearSlot(slot: HTMLElement): void {
	for (const cell of Array.from(slot.children) as HTMLElement[]) {
		cell.removeAttribute(MINI_FILLED_ATTR);
		cell.style.removeProperty(MINI_COLOR_VAR);
	}
}

export function paintHold(
	preview: HoldPreview,
	type: TetrominoType | null,
): void {
	clearSlot(preview.slot);
	if (type === null) return;
	const colour = TETROMINOES[type].color;
	for (const [dCol, dRow] of shapeOf(type, 0)) {
		const idx = dRow * 4 + dCol;
		const cell = preview.slot.children[idx] as HTMLElement | undefined;
		if (cell) {
			cell.setAttribute(MINI_FILLED_ATTR, "true");
			cell.style.setProperty(MINI_COLOR_VAR, colour);
		}
	}
}
