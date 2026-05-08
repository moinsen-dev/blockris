/**
 * Delayed Auto Shift (DAS) + Auto Repeat Rate (ARR) for left/right.
 *
 * Behaviour (Tetris guideline 2009 defaults DAS=170ms, ARR=50ms):
 * - On press: fire one move immediately.
 * - Hold in DAS window (0..dasDelay): no auto-repeat.
 * - After dasDelay elapses: fire every arrRate ms.
 * - On release: state resets so the next press fires immediately.
 *
 * Pure: tickDas(state, now, isHeld) returns the next state and a
 * boolean. No timers, no DOM. The caller drives `now` with the
 * tick-driver's clock so DAS/ARR is deterministic in tests.
 */

export interface DasArrConfig {
	readonly dasDelay: number;
	readonly arrRate: number;
}

export interface DasArrState {
	readonly config: DasArrConfig;
	readonly heldSince: number | null;
	readonly lastFireAt: number | null;
}

export const DEFAULT_DAS_ARR: DasArrConfig = { dasDelay: 170, arrRate: 50 };

export function createDasArrState(
	config: Partial<DasArrConfig> = {},
): DasArrState {
	const merged: DasArrConfig = { ...DEFAULT_DAS_ARR, ...config };
	if (!(merged.dasDelay >= 0) || !(merged.arrRate >= 0)) {
		throw new Error("dasDelay and arrRate must be >= 0");
	}
	return { config: merged, heldSince: null, lastFireAt: null };
}

export interface TickDasResult {
	readonly state: DasArrState;
	readonly shouldFire: boolean;
}

export function tickDas(
	state: DasArrState,
	now: number,
	isHeld: boolean,
): TickDasResult {
	// Released → reset (idempotent if already idle).
	if (!isHeld) {
		if (state.heldSince === null) return { state, shouldFire: false };
		return {
			state: createDasArrState(state.config),
			shouldFire: false,
		};
	}

	// Just pressed → immediate fire.
	if (state.heldSince === null) {
		return {
			state: { ...state, heldSince: now, lastFireAt: now },
			shouldFire: true,
		};
	}

	// Within DAS delay window → no auto-repeat.
	if (now < state.heldSince + state.config.dasDelay) {
		return { state, shouldFire: false };
	}

	// After DAS: fire when arrRate has elapsed since last fire.
	const lastFire = state.lastFireAt ?? state.heldSince;
	const sinceLast = now - lastFire;
	if (sinceLast >= state.config.arrRate) {
		return {
			state: { ...state, lastFireAt: now },
			shouldFire: true,
		};
	}
	return { state, shouldFire: false };
}
