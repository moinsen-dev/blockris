import { describe, expect, it } from "bun:test";
import {
	type GameState,
	applyIntent,
	newGame,
	restart,
	spawnNextPiece,
	togglePause,
} from "../game-state.ts";
import type { Cell } from "../board.ts";

function makeGameOver(): GameState {
	const fresh = newGame({ seed: 1 });
	const afterDrop = applyIntent(fresh, { kind: "hard-drop" }, 1);
	const blocked = afterDrop.board.map((row, r) =>
		r < 4 ? row.map(() => "T" as Cell) : row,
	);
	return spawnNextPiece({ ...afterDrop, active: null, board: blocked });
}

describe("togglePause", () => {
	it("running → paused", () => {
		const s = newGame({ seed: 1 });
		expect(s.status).toBe("running");
		const t = togglePause(s);
		expect(t.status).toBe("paused");
	});

	it("paused → running", () => {
		const s = togglePause(newGame({ seed: 1 }));
		expect(s.status).toBe("paused");
		const t = togglePause(s);
		expect(t.status).toBe("running");
	});

	it("game-over is sticky (idempotent)", () => {
		const go = makeGameOver();
		expect(go.status).toBe("game-over");
		const t = togglePause(go);
		expect(t.status).toBe("game-over");
		expect(t).toBe(go); // returns the same reference (no-op)
	});

	it("preserves board / score / level / lines / active", () => {
		const s = newGame({ seed: 1 });
		const t = togglePause(s);
		expect(t.board).toBe(s.board);
		expect(t.active).toBe(s.active);
		expect(t.score).toBe(s.score);
		expect(t.level).toBe(s.level);
		expect(t.lines).toBe(s.lines);
	});

	it("multiple toggles remain consistent", () => {
		let s = newGame({ seed: 1 });
		for (let i = 0; i < 6; i++) {
			s = togglePause(s);
			expect(s.status).toBe(i % 2 === 0 ? "paused" : "running");
		}
	});

	it("does not mutate the input state", () => {
		const s = newGame({ seed: 1 });
		const snap = s.status;
		togglePause(s);
		expect(s.status).toBe(snap);
	});
});

describe("restart", () => {
	it("returns a fresh running state with a seeded bag", () => {
		const s = newGame({ seed: 1 });
		const tickedThrice = applyIntent(
			applyIntent(applyIntent(s, { kind: "tick" }, 1), { kind: "tick" }, 2),
			{ kind: "tick" },
			3,
		);
		const r = restart(tickedThrice);
		expect(r.status).toBe("running");
		expect(r.score).toBe(0);
		expect(r.lines).toBe(0);
		expect(r.ticks).toBe(0);
		expect(r.bagQueue.length).toBeGreaterThanOrEqual(5);
	});

	it("preserves startLevel by default", () => {
		const s = newGame({ seed: 1, startLevel: 7 });
		const r = restart(s);
		expect(r.startLevel).toBe(7);
		expect(r.level).toBe(7);
	});

	it("custom startLevel overrides", () => {
		const s = newGame({ seed: 1, startLevel: 7 });
		const r = restart(s, { startLevel: 1 });
		expect(r.startLevel).toBe(1);
		expect(r.level).toBe(1);
	});

	it("custom seed produces a different bag", () => {
		const s = newGame({ seed: 1 });
		const a = restart(s, { seed: 1 });
		const b = restart(s, { seed: 999 });
		const aQ = a.bagQueue.slice(0, 5).join(",");
		const bQ = b.bagQueue.slice(0, 5).join(",");
		expect(aQ).not.toBe(bQ);
	});

	it("works from running, paused, and game-over states", () => {
		const fromRunning = restart(newGame({ seed: 1 }));
		const fromPaused = restart(togglePause(newGame({ seed: 1 })));
		const fromGameOver = restart(makeGameOver());
		expect(fromRunning.status).toBe("running");
		expect(fromPaused.status).toBe("running");
		expect(fromGameOver.status).toBe("running");
	});

	it("clears the board (no leftover blocks)", () => {
		const s = newGame({ seed: 1 });
		const dropped = applyIntent(s, { kind: "hard-drop" }, 1);
		const occupiedBefore = dropped.board.some((r) =>
			r.some((c) => c !== null),
		);
		expect(occupiedBefore).toBe(true);
		const r = restart(dropped);
		const occupiedAfter = r.board.some((row) => row.some((c) => c !== null));
		expect(occupiedAfter).toBe(false);
	});
});
