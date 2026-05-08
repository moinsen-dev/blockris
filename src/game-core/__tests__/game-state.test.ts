import { describe, expect, it } from "bun:test";
import { BOARD_COLS, BOARD_ROWS } from "../board.ts";
import {
	type GameState,
	applyIntent,
	newGame,
} from "../game-state.ts";

describe("game-state — newGame", () => {
	it("returns a fresh state with status=running", () => {
		const s = newGame();
		expect(s.status).toBe("running");
		expect(s.score).toBe(0);
		expect(s.lines).toBe(0);
		expect(s.ticks).toBe(0);
	});

	it("populates an empty 10x20 board", () => {
		const s = newGame();
		expect(s.board.length).toBe(BOARD_ROWS);
		expect(s.board[0]?.length).toBe(BOARD_COLS);
		const allEmpty = s.board.every((row) => row.every((c) => c === null));
		expect(allEmpty).toBe(true);
	});

	it("spawns an active piece at the top", () => {
		const s = newGame({ seed: 1 });
		expect(s.active).not.toBeNull();
		expect(s.active?.row).toBe(0);
	});

	it("queues at least 5 next pieces (preview HUD requirement)", () => {
		const s = newGame({ seed: 1 });
		expect(s.bagQueue.length).toBeGreaterThanOrEqual(5);
	});

	it("respects startLevel option", () => {
		expect(newGame({ startLevel: 5 }).level).toBe(5);
		expect(newGame({ startLevel: 1 }).level).toBe(1);
	});

	it("hold is null and canHold is true on a fresh game", () => {
		const s = newGame();
		expect(s.hold).toBeNull();
		expect(s.canHold).toBe(true);
	});

	it("two newGames with the same seed are identical (deterministic)", () => {
		const a = newGame({ seed: 42 });
		const b = newGame({ seed: 42 });
		expect(a.active).toEqual(b.active);
		expect(a.bagQueue).toEqual(b.bagQueue);
		expect(a.bagSeed).toBe(b.bagSeed);
	});

	it("two newGames with different seeds produce different bags", () => {
		const a = newGame({ seed: 1 });
		const b = newGame({ seed: 2 });
		// One of {active type, queue head} should differ
		const sameStart =
			a.active?.type === b.active?.type &&
			JSON.stringify(a.bagQueue.slice(0, 4)) ===
				JSON.stringify(b.bagQueue.slice(0, 4));
		expect(sameStart).toBe(false);
	});
});

describe("game-state — applyIntent purity", () => {
	it("returns a new object without mutating input state", () => {
		const s = newGame({ seed: 1 });
		const snap = JSON.parse(JSON.stringify(s));
		const next = applyIntent(s, { kind: "tick" }, 1);
		expect(next).not.toBe(s);
		expect(JSON.parse(JSON.stringify(s))).toEqual(snap);
	});

	it("does not mutate the board array", () => {
		const s = newGame({ seed: 1 });
		const boardRef = s.board;
		applyIntent(s, { kind: "hard-drop" }, 1);
		expect(s.board).toBe(boardRef);
	});

	it("identical inputs produce identical outputs", () => {
		const s = newGame({ seed: 7 });
		const a = applyIntent(s, { kind: "tick" }, 100);
		const b = applyIntent(s, { kind: "tick" }, 100);
		expect(a).toEqual(b);
	});

	it("lastIntentAt is updated to the now arg", () => {
		const s = newGame({ seed: 1 });
		const next = applyIntent(s, { kind: "tick" }, 12345);
		expect(next.lastIntentAt).toBe(12345);
	});
});

describe("game-state — intent semantics", () => {
	it("tick advances the active piece down by one row", () => {
		const s = newGame({ seed: 3 });
		const startRow = s.active?.row ?? -1;
		const next = applyIntent(s, { kind: "tick" }, 1);
		expect(next.active?.row).toBe(startRow + 1);
		expect(next.ticks).toBe(1);
	});

	it("move shifts the piece horizontally when legal", () => {
		const s = newGame({ seed: 3 });
		const startCol = s.active?.col ?? -1;
		const right = applyIntent(s, { kind: "move", direction: 1 }, 1);
		expect(right.active?.col).toBe(startCol + 1);
		const left = applyIntent(s, { kind: "move", direction: -1 }, 1);
		expect(left.active?.col).toBe(startCol - 1);
	});

	it("move into wall is a no-op", () => {
		// Slam left repeatedly until it can't go further, verify state stable
		let s = newGame({ seed: 3 });
		for (let i = 0; i < 20; i++) {
			s = applyIntent(s, { kind: "move", direction: -1 }, i);
		}
		const before = s.active?.col;
		const after = applyIntent(s, { kind: "move", direction: -1 }, 100);
		expect(after.active?.col).toBe(before ?? -1);
	});

	it("hard-drop locks the piece and spawns a new one", () => {
		const s = newGame({ seed: 5 });
		const dropped = applyIntent(s, { kind: "hard-drop" }, 1);
		expect(dropped.active?.row).toBe(0); // new piece spawned at top
		// At least one cell of the board is occupied now
		const occupied = dropped.board.some((row) => row.some((c) => c !== null));
		expect(occupied).toBe(true);
		expect(dropped.score).toBeGreaterThan(0);
	});

	it("pause + resume gates the rule-step", () => {
		const s = newGame({ seed: 1 });
		const paused = applyIntent(s, { kind: "pause" }, 1);
		expect(paused.status).toBe("paused");
		const tickWhilePaused = applyIntent(paused, { kind: "tick" }, 2);
		expect(tickWhilePaused.active?.row).toBe(paused.active?.row);
		const resumed = applyIntent(tickWhilePaused, { kind: "resume" }, 3);
		expect(resumed.status).toBe("running");
	});

	it("restart returns a fresh running state", () => {
		const s = newGame({ seed: 1 });
		const tick = applyIntent(s, { kind: "tick" }, 1);
		const restarted = applyIntent(tick, { kind: "restart" }, 2);
		expect(restarted.status).toBe("running");
		expect(restarted.score).toBe(0);
		expect(restarted.lines).toBe(0);
	});

	it("hold replaces active piece and disables further holds until lock", () => {
		const s = newGame({ seed: 1 });
		const held = applyIntent(s, { kind: "hold" }, 1);
		expect(held.hold).toBe(s.active?.type ?? null);
		expect(held.canHold).toBe(false);
		const heldAgain = applyIntent(held, { kind: "hold" }, 2);
		// No-op for hold: hold/active/canHold preserved; only lastIntentAt updates.
		expect(heldAgain.hold).toBe(held.hold);
		expect(heldAgain.active).toEqual(held.active);
		expect(heldAgain.canHold).toBe(held.canHold);
	});

	it("rotate rotates a non-O piece", () => {
		// O piece doesn't rotate visually; pick a seed where active != O
		let s = newGame({ seed: 9 });
		// If the seed-1 spawned an O, fast-forward by one hard-drop
		while (s.active?.type === "O") {
			s = applyIntent(s, { kind: "hard-drop" }, 0);
		}
		const startRot = s.active?.rotation ?? 0;
		const rotated = applyIntent(s, { kind: "rotate", direction: 1 }, 1);
		expect(rotated.active?.rotation).not.toBe(startRot);
	});

	it("game-over is reached when spawn fails (degenerate seed run)", () => {
		// Play out many hard-drops; eventually the stack tops out.
		let s: GameState = newGame({ seed: 99 });
		let safety = 200;
		while (s.status === "running" && safety-- > 0) {
			s = applyIntent(s, { kind: "hard-drop" }, safety);
		}
		expect(s.status).toBe("game-over");
	});
});
