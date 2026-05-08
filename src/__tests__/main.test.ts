/**
 * Smoke test for the main entry. Verifies the game can be
 * bootstrapped into a DOM, renders the 10×20 grid, paints the
 * active piece overlay, and responds to keyboard input.
 *
 * The full game-loop's requestAnimationFrame behaviour is left to
 * real-browser verification (see stress-scenario.test.ts for the
 * documented protocol). This test focuses on the wiring contracts.
 */

import { afterEach, describe, expect, it } from "bun:test";
import { BOARD_COLS, BOARD_ROWS } from "../game-core/board.ts";
import { bootstrap } from "../main.ts";

afterEach(() => {
	document.body.innerHTML = "";
});

function mountApp(): { host: HTMLElement; teardown: () => void } {
	const host = document.createElement("div");
	host.id = "app";
	host.setAttribute("data-test-mount", "true");
	document.body.appendChild(host);
	const teardown = bootstrap(host, 1);
	return { host, teardown };
}

describe("bootstrap — main entry", () => {
	it("mounts a 10×20 grid into the host", () => {
		const { host, teardown } = mountApp();
		const cells = host.querySelectorAll("[data-cell-row], [data-row]");
		expect(cells.length).toBe(BOARD_COLS * BOARD_ROWS);
		teardown();
	});

	it("renders an active piece overlay (4 cells)", () => {
		const { host, teardown } = mountApp();
		const overlay = host.querySelectorAll(".piece-overlay");
		expect(overlay.length).toBe(4);
		teardown();
	});

	it("renders a HUD with score / level / lines", () => {
		const { host, teardown } = mountApp();
		const text = host.textContent ?? "";
		expect(text.toLowerCase()).toContain("score");
		expect(text.toLowerCase()).toContain("level");
		expect(text.toLowerCase()).toContain("lines");
		teardown();
	});

	it("responds to ArrowDown keydown by soft-dropping the piece by one row", () => {
		const { host, teardown } = mountApp();
		const beforeRow = Math.min(
			...Array.from(
				host.querySelectorAll<HTMLElement>(".piece-overlay"),
			).map((el) => Number(el.getAttribute("data-row"))),
		);
		window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown" }));
		const afterRow = Math.min(
			...Array.from(
				host.querySelectorAll<HTMLElement>(".piece-overlay"),
			).map((el) => Number(el.getAttribute("data-row"))),
		);
		expect(afterRow).toBe(beforeRow + 1);
		teardown();
	});

	it("ArrowLeft / ArrowRight keydown alone does NOT move (DAS-driven only)", () => {
		// Single keydown for left/right is consumed only by heldKeys —
		// the actual move happens in the RAF loop's tickDas → first-frame
		// shouldFire path. This avoids the double-dispatch bug where the
		// piece skipped two cells per press.
		const { host, teardown } = mountApp();
		const beforeCols = Array.from(
			host.querySelectorAll<HTMLElement>(".piece-overlay"),
		).map((el) => el.getAttribute("data-col"));
		window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight" }));
		const afterCols = Array.from(
			host.querySelectorAll<HTMLElement>(".piece-overlay"),
		).map((el) => el.getAttribute("data-col"));
		expect(afterCols).toEqual(beforeCols);
		teardown();
	});

	it("teardown removes keyboard listeners (further keys do nothing visible)", () => {
		const { host, teardown } = mountApp();
		teardown();
		// ArrowDown soft-drops on a live game; after teardown it should be
		// a no-op (listener removed). Snapshot row, fire, expect unchanged.
		const before = Array.from(
			host.querySelectorAll<HTMLElement>(".piece-overlay"),
		).map((el) => el.getAttribute("data-row"));
		window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown" }));
		const after = Array.from(
			host.querySelectorAll<HTMLElement>(".piece-overlay"),
		).map((el) => el.getAttribute("data-row"));
		expect(after).toEqual(before);
	});

	it("Space (hard-drop) locks the piece and adds at least 1 filled cell", () => {
		const { host, teardown } = mountApp();
		const filledBefore = host.querySelectorAll(
			'[data-filled="true"]',
		).length;
		window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
		const filledAfter = host.querySelectorAll(
			'[data-filled="true"]',
		).length;
		expect(filledAfter).toBeGreaterThan(filledBefore);
		teardown();
	});

	it("KeyP toggles the HUD status to 'paused'", () => {
		const { host, teardown } = mountApp();
		window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyP" }));
		const text = host.textContent ?? "";
		expect(text.toLowerCase()).toContain("paused");
		teardown();
	});

	it("KeyP again toggles back to 'playing'", () => {
		const { host, teardown } = mountApp();
		window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyP" }));
		window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyP" }));
		const text = host.textContent ?? "";
		expect(text.toLowerCase()).toContain("playing");
		teardown();
	});

	it("seeded bootstrap is deterministic (same seed → same first piece)", () => {
		const { host: h1, teardown: t1 } = mountApp();
		const overlay1Type = h1
			.querySelector(".piece-overlay")
			?.getAttribute("data-overlay-type");
		t1();
		document.body.innerHTML = "";
		const { host: h2, teardown: t2 } = mountApp();
		const overlay2Type = h2
			.querySelector(".piece-overlay")
			?.getAttribute("data-overlay-type");
		t2();
		expect(overlay1Type).toBe(overlay2Type ?? null);
	});

	it("renders the queue preview with 5 next pieces", () => {
		const { host, teardown } = mountApp();
		const queueRoot = host.querySelector('[data-slot="queue"]');
		expect(queueRoot).not.toBeNull();
		const slots = queueRoot?.querySelectorAll(".blockris-mini") ?? [];
		expect(slots.length).toBe(5);
		// Each filled slot should have 4 mini-filled cells.
		for (const slot of Array.from(slots)) {
			const filled = (slot as HTMLElement).querySelectorAll(
				'[data-mini-filled="true"]',
			);
			expect(filled.length).toBe(4);
		}
		teardown();
	});

	it("renders the hold preview slot (empty on fresh game)", () => {
		const { host, teardown } = mountApp();
		const holdRoot = host.querySelector('[data-slot="hold"]');
		expect(holdRoot).not.toBeNull();
		const slot = holdRoot?.querySelector(".blockris-mini");
		expect(slot).not.toBeNull();
		const filled = slot?.querySelectorAll('[data-mini-filled="true"]') ?? [];
		expect(filled.length).toBe(0);
		teardown();
	});

	it("renders ghost cells below the active piece", () => {
		const { host, teardown } = mountApp();
		const ghosts = host.querySelectorAll('[data-ghost="true"]');
		// Active piece spawns at row 0; ghost lands somewhere below it
		expect(ghosts.length).toBeGreaterThan(0);
		expect(ghosts.length).toBeLessThanOrEqual(4);
		teardown();
	});

	it("KeyC fills the hold preview with the active piece type", () => {
		const { host, teardown } = mountApp();
		const heldType =
			host.querySelector(".piece-overlay")?.getAttribute("data-overlay-type") ??
			null;
		window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyC" }));
		const holdSlot = host.querySelector(
			'[data-slot="hold"] .blockris-mini',
		) as HTMLElement | null;
		const filled = holdSlot?.querySelectorAll(
			'[data-mini-filled="true"]',
		) ?? [];
		expect(filled.length).toBe(4);
		// And the type sits in the colour CSS variable somewhere
		const sample = filled[0] as HTMLElement | undefined;
		expect(sample?.style.getPropertyValue("--mini-color")).toBeTruthy();
		expect(heldType).not.toBeNull();
		teardown();
	});

	it("status pill toggles class to blockris-status-paused on pause", () => {
		const { host, teardown } = mountApp();
		window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyP" }));
		const paused = host.querySelector(".blockris-status-paused");
		expect(paused).not.toBeNull();
		teardown();
	});
});
