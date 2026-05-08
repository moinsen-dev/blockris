import { describe, expect, test } from "bun:test";
import { BOARD_COLS, BOARD_ROWS } from "../../game-core/board.ts";
import { createPlayfield } from "../dom-playfield.ts";

function freshParent(): HTMLElement {
	document.body.innerHTML = "";
	const div = document.createElement("div");
	document.body.appendChild(div);
	return div;
}

describe("createPlayfield — AC1: returns {root, cells, getCell}", () => {
	test("cells.length === 200 (10 cols × 20 rows)", () => {
		const pf = createPlayfield(freshParent());
		expect(pf.cells.length).toBe(BOARD_COLS * BOARD_ROWS);
		expect(pf.cells.length).toBe(200);
	});

	test("getCell(col, row) returns the right element", () => {
		const pf = createPlayfield(freshParent());
		const cell = pf.getCell(3, 5);
		expect(cell).not.toBeNull();
		expect(cell!.getAttribute("data-col")).toBe("3");
		expect(cell!.getAttribute("data-row")).toBe("5");
	});

	test("getCell returns null for out-of-bounds", () => {
		const pf = createPlayfield(freshParent());
		expect(pf.getCell(-1, 0)).toBeNull();
		expect(pf.getCell(10, 0)).toBeNull();
		expect(pf.getCell(0, -1)).toBeNull();
		expect(pf.getCell(0, 20)).toBeNull();
	});
});

describe("createPlayfield — AC2: each cell has data-col + data-row", () => {
	test("all 200 cells have both attributes", () => {
		const pf = createPlayfield(freshParent());
		for (const cell of pf.cells) {
			expect(cell.getAttribute("data-col")).not.toBeNull();
			expect(cell.getAttribute("data-row")).not.toBeNull();
		}
	});

	test("attributes match position in row-major flat order", () => {
		const pf = createPlayfield(freshParent());
		for (let r = 0; r < BOARD_ROWS; r++) {
			for (let c = 0; c < BOARD_COLS; c++) {
				const cell = pf.cells[r * BOARD_COLS + c]!;
				expect(cell.getAttribute("data-col")).toBe(String(c));
				expect(cell.getAttribute("data-row")).toBe(String(r));
			}
		}
	});
});

describe("createPlayfield — AC3: total node count is 200 cells + 1 root", () => {
	test("parent has exactly 1 child (the playfield root)", () => {
		const parent = freshParent();
		createPlayfield(parent);
		expect(parent.children.length).toBe(1);
	});

	test("root has exactly 200 children (the cells)", () => {
		const pf = createPlayfield(freshParent());
		expect(pf.root.children.length).toBe(200);
	});
});

describe("Playfield style sanity", () => {
	test("root is marked with data-playfield=true", () => {
		const pf = createPlayfield(freshParent());
		expect(pf.root.getAttribute("data-playfield")).toBe("true");
	});

	test("cells start with data-filled=false", () => {
		const pf = createPlayfield(freshParent());
		for (const cell of pf.cells) {
			expect(cell.getAttribute("data-filled")).toBe("false");
		}
	});

	test("custom cellPx overrides default", () => {
		const pf = createPlayfield(freshParent(), { cellPx: 24 });
		expect(pf.root.style.gridTemplateColumns).toContain("24px");
	});
});
