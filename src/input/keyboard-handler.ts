/**
 * Keyboard input → typed Intent mapping.
 *
 * The keyboard layer is a thin translator. It reads `event.code`
 * (so "Z" works the same on QWERTY/AZERTY/DVORAK) and produces a
 * KeyAction, then maps that action onto the game-state reducer's
 * Intent based on the current game status.
 *
 * Splitting the conversion in two halves (event → action → intent)
 * makes both halves trivially unit-testable without a DOM keyboard
 * event implementation.
 */

import type { GameStatus, Intent } from "../game-core/game-state.ts";

export interface KeyEventLike {
	readonly code: string;
	readonly repeat?: boolean;
}

export type KeyAction =
	| "move-left"
	| "move-right"
	| "soft-drop"
	| "hard-drop"
	| "rotate-cw"
	| "rotate-ccw"
	| "hold"
	| "pause"
	| "restart"
	| "none";

export type KeyBindings = { readonly [code: string]: KeyAction };

export const KEY_BINDINGS: KeyBindings = {
	ArrowLeft: "move-left",
	ArrowRight: "move-right",
	ArrowDown: "soft-drop",
	Space: "hard-drop",
	ArrowUp: "rotate-cw",
	KeyX: "rotate-cw",
	KeyZ: "rotate-ccw",
	KeyC: "hold",
	KeyP: "pause",
	KeyR: "restart",
};

export function actionFromEvent(
	event: KeyEventLike,
	bindings: KeyBindings = KEY_BINDINGS,
): KeyAction {
	return bindings[event.code] ?? "none";
}

export function intentFromAction(
	action: KeyAction,
	status: GameStatus,
): Intent | null {
	// pause/resume + restart are valid in any status (with stickiness rules
	// already enforced by the reducer).
	if (action === "pause") {
		if (status === "running") return { kind: "pause" };
		if (status === "paused") return { kind: "resume" };
		return null;
	}
	if (action === "restart") return { kind: "restart" };

	// All other actions only apply while running.
	if (status !== "running") return null;

	switch (action) {
		case "move-left":
			return { kind: "move", direction: -1 };
		case "move-right":
			return { kind: "move", direction: 1 };
		case "soft-drop":
			return { kind: "soft-drop" };
		case "hard-drop":
			return { kind: "hard-drop" };
		case "rotate-cw":
			return { kind: "rotate", direction: 1 };
		case "rotate-ccw":
			return { kind: "rotate", direction: -1 };
		case "hold":
			return { kind: "hold" };
		case "none":
			return null;
	}
}

/**
 * Convenience: take a keyboard event + a state-with-status and
 * return the Intent (or null) that should be dispatched. Most
 * call-sites use this directly.
 */
export function handleKey(
	event: KeyEventLike,
	state: { readonly status: GameStatus },
	bindings: KeyBindings = KEY_BINDINGS,
): Intent | null {
	const action = actionFromEvent(event, bindings);
	return intentFromAction(action, state.status);
}
