import { describe, expect, it } from "bun:test";
import { BOARD_COLS, BOARD_ROWS, type Cell } from "../board.ts";
import {
	type GameState,
	applyIntent,
	newGame,
	spawnNextPiece,
} from "../game-state.ts";

function fillTopRows(state: GameState, rows: number, except: number): GameState {
	const board = state.board.map((row, r) =>
		r < rows
			? row.map((cell, c) => (c === except ? cell : ("T" as Cell)))
			: row,
	);
	return { ...state, board };
}

function fillEverywhere(state: GameState, rows: number): GameState {
	const board = state.board.map((row, r) =>
		r < rows ? row.map(() => "T" as Cell) : row,
	);
	return { ...state, board };
}

describe("spawnNextPiece", () => {
	it("returns a running state with a new active piece on an empty board", () => {
		// Take a fresh game, drop the active so the next spawn pulls the
		// 2nd queued piece, and inspect the result.
		const s = newGame({ seed: 1 });
		const next = spawnNextPiece({ ...s, active: null, board: s.board });
		expect(next.status).toBe("running");
		expect(next.active).not.toBeNull();
		expect(next.active?.row).toBe(0);
	});

	it("flips status to game-over when the spawn cell is occupied", () => {
		// Block the entire top 4 rows so any spawn collides.
		const s = newGame({ seed: 1 });
		const blocked = fillEverywhere(s, 4);
		const next = spawnNextPiece({ ...blocked, active: null });
		expect(next.status).toBe("game-over");
		expect(next.active).toBeNull();
	});

	it("advances the bag (consumes one piece) regardless of spawn outcome", () => {
		const s = newGame({ seed: 1 });
		const blocked = fillEverywhere(s, 4);
		const before = blocked.bagQueue.slice();
		const next = spawnNextPiece({ ...blocked, active: null });
		expect(next.bagQueue.length).toBeLessThan(before.length + 7); // bag advanced
		expect(next.bagQueue).not.toEqual(before);
	});

	it("resets canHold to true on successful spawn", () => {
		const s = { ...newGame({ seed: 1 }), canHold: false, active: null };
		const next = spawnNextPiece(s);
		expect(next.canHold).toBe(true);
	});

	it("is pure — does not mutate input", () => {
		const s = newGame({ seed: 1 });
		const snap = JSON.parse(JSON.stringify(s));
		spawnNextPiece(s);
		expect(JSON.parse(JSON.stringify(s))).toEqual(snap);
	});
});

describe("game-over stickiness", () => {
	function makeGameOver(): GameState {
		// First lock a real piece so the board has at least one filled cell
		// from gameplay (not synthetic fill). Then artificially block the
		// spawn zone and re-spawn to trigger the spawn-collision path.
		const fresh = newGame({ seed: 1 });
		const afterDrop = applyIntent(fresh, { kind: "hard-drop" }, 1);
		const blocked = fillEverywhere(afterDrop, 4);
		return spawnNextPiece({ ...blocked, active: null });
	}

	it("once status=game-over, tick is a no-op (only lastIntentAt updates)", () => {
		const go = makeGameOver();
		expect(go.status).toBe("game-over");
		const after = applyIntent(go, { kind: "tick" }, 99);
		expect(after.status).toBe("game-over");
		expect(after.board).toBe(go.board);
		expect(after.active).toBe(go.active);
		expect(after.score).toBe(go.score);
		expect(after.lastIntentAt).toBe(99);
	});

	it("move / rotate / hard-drop / hold / soft-drop are all no-ops on game-over", () => {
		const go = makeGameOver();
		const intents = [
			{ kind: "move" as const, direction: 1 as const },
			{ kind: "move" as const, direction: -1 as const },
			{ kind: "rotate" as const, direction: 1 as const },
			{ kind: "rotate" as const, direction: -1 as const },
			{ kind: "hard-drop" as const },
			{ kind: "soft-drop" as const },
			{ kind: "hold" as const },
		];
		for (const intent of intents) {
			const after = applyIntent(go, intent, 1);
			expect(after.status).toBe("game-over");
			expect(after.board).toBe(go.board);
			expect(after.active).toBe(go.active);
			expect(after.score).toBe(go.score);
			expect(after.lines).toBe(go.lines);
		}
	});

	it("pause / resume cannot change status away from game-over", () => {
		const go = makeGameOver();
		const paused = applyIntent(go, { kind: "pause" }, 1);
		expect(paused.status).toBe("game-over");
		const resumed = applyIntent(go, { kind: "resume" }, 1);
		expect(resumed.status).toBe("game-over");
	});

	it("only `restart` exits a game-over state", () => {
		const go = makeGameOver();
		const restarted = applyIntent(go, { kind: "restart" }, 1);
		expect(restarted.status).toBe("running");
		expect(restarted.score).toBe(0);
		expect(restarted.lines).toBe(0);
		expect(restarted.active).not.toBeNull();
	});

	it("game-over board has at least one filled cell (a piece DID lock first)", () => {
		const go = makeGameOver();
		const occupied = go.board.some((row) => row.some((c) => c !== null));
		expect(occupied).toBe(true);
	});

	it("board dimensions remain 10x20 in game-over state", () => {
		const go = makeGameOver();
		expect(go.board.length).toBe(BOARD_ROWS);
		expect(go.board[0]?.length).toBe(BOARD_COLS);
	});
});
