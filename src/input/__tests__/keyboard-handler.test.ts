import { describe, expect, it } from "bun:test";
import {
	KEY_BINDINGS,
	type KeyAction,
	actionFromEvent,
	handleKey,
	intentFromAction,
} from "../keyboard-handler.ts";

const RUNNING = { status: "running" as const };
const PAUSED = { status: "paused" as const };
const GAME_OVER = { status: "game-over" as const };

describe("actionFromEvent", () => {
	it("maps default bindings to actions", () => {
		const cases: Array<[string, KeyAction]> = [
			["ArrowLeft", "move-left"],
			["ArrowRight", "move-right"],
			["ArrowDown", "soft-drop"],
			["Space", "hard-drop"],
			["ArrowUp", "rotate-cw"],
			["KeyX", "rotate-cw"],
			["KeyZ", "rotate-ccw"],
			["KeyC", "hold"],
			["KeyP", "pause"],
			["KeyR", "restart"],
		];
		for (const [code, expected] of cases) {
			expect(actionFromEvent({ code })).toBe(expected);
		}
	});

	it("returns 'none' for unbound keys", () => {
		expect(actionFromEvent({ code: "KeyQ" })).toBe("none");
		expect(actionFromEvent({ code: "F1" })).toBe("none");
	});

	it("honours custom bindings", () => {
		const custom = { KeyA: "move-left" as const, KeyD: "move-right" as const };
		expect(actionFromEvent({ code: "KeyA" }, custom)).toBe("move-left");
		expect(actionFromEvent({ code: "ArrowLeft" }, custom)).toBe("none");
	});
});

describe("intentFromAction — running state", () => {
	it("move-left → {kind: move, direction: -1}", () => {
		expect(intentFromAction("move-left", "running")).toEqual({
			kind: "move",
			direction: -1,
		});
	});

	it("move-right → {kind: move, direction: 1}", () => {
		expect(intentFromAction("move-right", "running")).toEqual({
			kind: "move",
			direction: 1,
		});
	});

	it("soft-drop / hard-drop / hold map to their kinds", () => {
		expect(intentFromAction("soft-drop", "running")).toEqual({
			kind: "soft-drop",
		});
		expect(intentFromAction("hard-drop", "running")).toEqual({
			kind: "hard-drop",
		});
		expect(intentFromAction("hold", "running")).toEqual({ kind: "hold" });
	});

	it("rotate-cw → {kind: rotate, direction: 1}", () => {
		expect(intentFromAction("rotate-cw", "running")).toEqual({
			kind: "rotate",
			direction: 1,
		});
	});

	it("rotate-ccw → {kind: rotate, direction: -1}", () => {
		expect(intentFromAction("rotate-ccw", "running")).toEqual({
			kind: "rotate",
			direction: -1,
		});
	});

	it("pause from running → pause intent", () => {
		expect(intentFromAction("pause", "running")).toEqual({ kind: "pause" });
	});

	it("'none' returns null", () => {
		expect(intentFromAction("none", "running")).toBeNull();
	});
});

describe("intentFromAction — paused state", () => {
	it("pause toggles back to resume", () => {
		expect(intentFromAction("pause", "paused")).toEqual({ kind: "resume" });
	});

	it("gameplay actions are suppressed while paused", () => {
		const blocked: KeyAction[] = [
			"move-left",
			"move-right",
			"soft-drop",
			"hard-drop",
			"rotate-cw",
			"rotate-ccw",
			"hold",
		];
		for (const a of blocked) {
			expect(intentFromAction(a, "paused")).toBeNull();
		}
	});

	it("restart is allowed while paused", () => {
		expect(intentFromAction("restart", "paused")).toEqual({ kind: "restart" });
	});
});

describe("intentFromAction — game-over state", () => {
	it("gameplay + pause are suppressed", () => {
		const blocked: KeyAction[] = [
			"move-left",
			"move-right",
			"soft-drop",
			"hard-drop",
			"rotate-cw",
			"rotate-ccw",
			"hold",
			"pause",
		];
		for (const a of blocked) {
			expect(intentFromAction(a, "game-over")).toBeNull();
		}
	});

	it("only restart escapes game-over", () => {
		expect(intentFromAction("restart", "game-over")).toEqual({
			kind: "restart",
		});
	});
});

describe("handleKey end-to-end", () => {
	it("ArrowRight in running state → move right intent", () => {
		expect(handleKey({ code: "ArrowRight" }, RUNNING)).toEqual({
			kind: "move",
			direction: 1,
		});
	});

	it("Space in paused state → null", () => {
		expect(handleKey({ code: "Space" }, PAUSED)).toBeNull();
	});

	it("KeyR in game-over → restart", () => {
		expect(handleKey({ code: "KeyR" }, GAME_OVER)).toEqual({
			kind: "restart",
		});
	});

	it("KeyP in game-over → null (pause is suppressed)", () => {
		expect(handleKey({ code: "KeyP" }, GAME_OVER)).toBeNull();
	});

	it("custom bindings are respected end-to-end", () => {
		const custom = { KeyJ: "move-left" as const };
		expect(handleKey({ code: "KeyJ" }, RUNNING, custom)).toEqual({
			kind: "move",
			direction: -1,
		});
		expect(handleKey({ code: "ArrowLeft" }, RUNNING, custom)).toBeNull();
	});

	it("unbound key in any state → null", () => {
		expect(handleKey({ code: "KeyQ" }, RUNNING)).toBeNull();
		expect(handleKey({ code: "KeyQ" }, PAUSED)).toBeNull();
		expect(handleKey({ code: "KeyQ" }, GAME_OVER)).toBeNull();
	});
});

describe("KEY_BINDINGS constant", () => {
	it("exports the standard guideline bindings", () => {
		expect(KEY_BINDINGS.ArrowLeft).toBe("move-left");
		expect(KEY_BINDINGS.ArrowRight).toBe("move-right");
		expect(KEY_BINDINGS.ArrowDown).toBe("soft-drop");
		expect(KEY_BINDINGS.ArrowUp).toBe("rotate-cw");
		expect(KEY_BINDINGS.Space).toBe("hard-drop");
		expect(KEY_BINDINGS.KeyZ).toBe("rotate-ccw");
		expect(KEY_BINDINGS.KeyX).toBe("rotate-cw");
		expect(KEY_BINDINGS.KeyC).toBe("hold");
		expect(KEY_BINDINGS.KeyP).toBe("pause");
	});
});
