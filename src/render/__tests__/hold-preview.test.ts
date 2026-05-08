import { afterEach, describe, expect, it } from "bun:test";
import { TETROMINOES } from "../../game-core/tetromino-types.ts";
import { createHoldPreview, paintHold } from "../hold-preview.ts";
import { MINI_COLOR_VAR, MINI_FILLED_ATTR } from "../queue-preview.ts";

afterEach(() => {
	document.body.innerHTML = "";
});

function mount() {
	const host = document.createElement("div");
	document.body.appendChild(host);
	return host;
}

describe("createHoldPreview", () => {
	it("attaches a single 4×4 slot to the parent", () => {
		const host = mount();
		const h = createHoldPreview(host);
		expect(host.contains(h.root)).toBe(true);
		expect(h.slot.children.length).toBe(16);
	});
});

describe("paintHold", () => {
	it("renders 4 filled cells for a non-null piece", () => {
		const host = mount();
		const h = createHoldPreview(host);
		paintHold(h, "T");
		const filled = Array.from(h.slot.children).filter((c) =>
			(c as HTMLElement).hasAttribute(MINI_FILLED_ATTR),
		);
		expect(filled.length).toBe(4);
	});

	it("paints the cells with the piece's colour", () => {
		const host = mount();
		const h = createHoldPreview(host);
		paintHold(h, "Z");
		const filled = Array.from(h.slot.children).find((c) =>
			(c as HTMLElement).hasAttribute(MINI_FILLED_ATTR),
		) as HTMLElement | undefined;
		expect(filled?.style.getPropertyValue(MINI_COLOR_VAR)).toBe(
			TETROMINOES.Z.color,
		);
	});

	it("renders nothing when piece is null (empty hold)", () => {
		const host = mount();
		const h = createHoldPreview(host);
		paintHold(h, null);
		const filled = Array.from(h.slot.children).filter((c) =>
			(c as HTMLElement).hasAttribute(MINI_FILLED_ATTR),
		);
		expect(filled.length).toBe(0);
	});

	it("re-painting null after a piece clears the slot", () => {
		const host = mount();
		const h = createHoldPreview(host);
		paintHold(h, "L");
		paintHold(h, null);
		const filled = Array.from(h.slot.children).filter((c) =>
			(c as HTMLElement).hasAttribute(MINI_FILLED_ATTR),
		);
		expect(filled.length).toBe(0);
	});

	it("re-painting another type swaps colour cleanly", () => {
		const host = mount();
		const h = createHoldPreview(host);
		paintHold(h, "T");
		paintHold(h, "I");
		const filled = Array.from(h.slot.children).filter((c) =>
			(c as HTMLElement).hasAttribute(MINI_FILLED_ATTR),
		) as HTMLElement[];
		expect(filled.length).toBe(4);
		expect(filled[0]?.style.getPropertyValue(MINI_COLOR_VAR)).toBe(
			TETROMINOES.I.color,
		);
	});
});
