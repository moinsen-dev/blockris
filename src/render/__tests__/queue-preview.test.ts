import { afterEach, describe, expect, it } from "bun:test";
import { TETROMINOES } from "../../game-core/tetromino-types.ts";
import {
	MINI_COLOR_VAR,
	MINI_FILLED_ATTR,
	createQueuePreview,
	paintQueue,
} from "../queue-preview.ts";

afterEach(() => {
	document.body.innerHTML = "";
});

function mount() {
	const host = document.createElement("div");
	document.body.appendChild(host);
	return host;
}

describe("createQueuePreview", () => {
	it("creates 5 slots by default", () => {
		const host = mount();
		const q = createQueuePreview(host);
		expect(q.slots.length).toBe(5);
	});

	it("respects a custom count", () => {
		const host = mount();
		const q = createQueuePreview(host, 3);
		expect(q.slots.length).toBe(3);
	});

	it("each slot has 16 cells (4×4)", () => {
		const host = mount();
		const q = createQueuePreview(host, 1);
		expect(q.slots[0]?.children.length).toBe(16);
	});

	it("attaches root to the parent", () => {
		const host = mount();
		const q = createQueuePreview(host);
		expect(host.contains(q.root)).toBe(true);
	});
});

describe("paintQueue", () => {
	it("marks the correct cells for each piece type", () => {
		const host = mount();
		const q = createQueuePreview(host, 2);
		paintQueue(q, ["T", "I"]);
		const slot0 = q.slots[0]!;
		const slot1 = q.slots[1]!;
		const filled0 = Array.from(slot0.children).filter((c) =>
			(c as HTMLElement).hasAttribute(MINI_FILLED_ATTR),
		);
		const filled1 = Array.from(slot1.children).filter((c) =>
			(c as HTMLElement).hasAttribute(MINI_FILLED_ATTR),
		);
		expect(filled0.length).toBe(4);
		expect(filled1.length).toBe(4);
	});

	it("applies the piece colour to filled cells", () => {
		const host = mount();
		const q = createQueuePreview(host, 1);
		paintQueue(q, ["S"]);
		const filled = Array.from(q.slots[0]!.children).find((c) =>
			(c as HTMLElement).hasAttribute(MINI_FILLED_ATTR),
		) as HTMLElement | undefined;
		expect(filled?.style.getPropertyValue(MINI_COLOR_VAR)).toBe(
			TETROMINOES.S.color,
		);
	});

	it("clears slot when no piece is supplied for that index", () => {
		const host = mount();
		const q = createQueuePreview(host, 3);
		paintQueue(q, ["T", "I"]); // only 2 supplied
		const slot2 = q.slots[2]!;
		const filled = Array.from(slot2.children).filter((c) =>
			(c as HTMLElement).hasAttribute(MINI_FILLED_ATTR),
		);
		expect(filled.length).toBe(0);
	});

	it("re-painting clears stale fills", () => {
		const host = mount();
		const q = createQueuePreview(host, 1);
		paintQueue(q, ["T"]);
		paintQueue(q, ["O"]);
		const filled = Array.from(q.slots[0]!.children).filter((c) =>
			(c as HTMLElement).hasAttribute(MINI_FILLED_ATTR),
		);
		// O-piece occupies exactly 4 cells — same count as T but different positions
		expect(filled.length).toBe(4);
		const colour = (filled[0] as HTMLElement).style.getPropertyValue(
			MINI_COLOR_VAR,
		);
		expect(colour).toBe(TETROMINOES.O.color);
	});

	it("each of the 7 tetromino types paints exactly 4 cells", () => {
		const host = mount();
		const q = createQueuePreview(host, 7);
		paintQueue(q, ["I", "O", "T", "S", "Z", "J", "L"]);
		for (let i = 0; i < 7; i++) {
			const filled = Array.from(q.slots[i]!.children).filter((c) =>
				(c as HTMLElement).hasAttribute(MINI_FILLED_ATTR),
			);
			expect(filled.length).toBe(4);
		}
	});
});
