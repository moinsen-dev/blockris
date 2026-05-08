/**
 * Top-level game-state machine — pure-functional reducer.
 *
 * GameState is a value type. applyIntent(state, intent, now) returns
 * a NEW state (no mutation of inputs). That's what makes the rule-
 * step deterministic and unit-testable without DOM / motion.dev /
 * timers.
 *
 * The bag is held inline as { bagSeed, bagQueue } rather than as a
 * stateful BagRandomizer instance, so state is fully serialisable
 * and applyIntent stays pure.
 */

import {
	BOARD_COLS,
	BOARD_ROWS,
	canPlacePiece,
	emptyBoard,
	placePiece,
	type Board,
} from "./board.ts";
import {
	canMove,
	dropDistance,
	hardDrop as hardDropRow,
} from "./gravity.ts";
import { clearAndCollapse } from "./line-clear.ts";
import {
	levelFor,
	linesToNextLevel as linesToNextLevelRaw,
	scoreForLines,
} from "./scoring.ts";
import {
	getKickTable,
	rotateBy,
	transitionKey,
	type Rotation,
	type TetrominoType,
	TETROMINO_TYPES,
} from "./tetromino-types.ts";

export interface ActivePiece {
	readonly type: TetrominoType;
	readonly rotation: Rotation;
	readonly col: number;
	readonly row: number;
}

export type GameStatus = "running" | "paused" | "game-over";

export interface GameState {
	readonly board: Board;
	readonly active: ActivePiece | null;
	readonly hold: TetrominoType | null;
	readonly canHold: boolean;
	readonly bagSeed: number;
	readonly bagQueue: ReadonlyArray<TetrominoType>;
	readonly score: number;
	readonly level: number;
	readonly lines: number;
	readonly status: GameStatus;
	readonly startLevel: number;
	readonly ticks: number;
	readonly lastIntentAt: number;
}

export type Intent =
	| { kind: "tick" }
	| { kind: "move"; direction: -1 | 1 }
	| { kind: "soft-drop" }
	| { kind: "hard-drop" }
	| { kind: "rotate"; direction: 1 | -1 }
	| { kind: "hold" }
	| { kind: "pause" }
	| { kind: "resume" }
	| { kind: "restart" };

export interface NewGameOptions {
	seed?: number;
	startLevel?: number;
}

const DEFAULT_SEED = 0xc0ffee;
const QUEUE_PREVIEW = 5;

/** Pure deterministic shuffle. Returns shuffled copy + advanced seed. */
function shuffleFromSeed<T>(
	items: ReadonlyArray<T>,
	seed: number,
): { shuffled: T[]; seed: number } {
	const arr = [...items];
	let s = seed >>> 0;
	for (let i = arr.length - 1; i > 0; i--) {
		s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
		const j = s % (i + 1);
		const tmp = arr[i] as T;
		arr[i] = arr[j] as T;
		arr[j] = tmp;
	}
	return { shuffled: arr, seed: s };
}

function refillUntil(
	queue: ReadonlyArray<TetrominoType>,
	seed: number,
	min: number,
): { queue: TetrominoType[]; seed: number } {
	let q: TetrominoType[] = [...queue];
	let s = seed;
	while (q.length < min) {
		const next = shuffleFromSeed(TETROMINO_TYPES, s);
		q = [...q, ...next.shuffled];
		s = next.seed;
	}
	return { queue: q, seed: s };
}

function consumeFromBag(
	queue: ReadonlyArray<TetrominoType>,
	seed: number,
): { piece: TetrominoType; queue: TetrominoType[]; seed: number } {
	const filled = refillUntil(queue, seed, QUEUE_PREVIEW + 1);
	const [piece, ...rest] = filled.queue;
	const refilled = refillUntil(rest, filled.seed, QUEUE_PREVIEW);
	return { piece: piece as TetrominoType, queue: refilled.queue, seed: refilled.seed };
}

/** Spawn the given piece at the standard top-of-board position. */
function spawnPosition(type: TetrominoType): ActivePiece {
	// Convention: spawn near horizontal centre, row 0.
	// I-piece is 4 cells wide → spawn at col 3; others (3-wide bbox) → col 3.
	const col = type === "O" ? 4 : 3;
	return { type, rotation: 0, col, row: 0 };
}

function newGameInternal(seed: number, startLevel: number): GameState {
	const filled = refillUntil([], seed, QUEUE_PREVIEW + 1);
	const [first, ...rest] = filled.queue;
	const refilled = refillUntil(rest, filled.seed, QUEUE_PREVIEW);
	const active = spawnPosition(first as TetrominoType);
	return {
		board: emptyBoard(),
		active,
		hold: null,
		canHold: true,
		bagSeed: refilled.seed,
		bagQueue: refilled.queue,
		score: 0,
		level: startLevel,
		lines: 0,
		status: "running",
		startLevel,
		ticks: 0,
		lastIntentAt: 0,
	};
}

export function newGame(opts: NewGameOptions = {}): GameState {
	const seed = opts.seed ?? DEFAULT_SEED;
	const startLevel = opts.startLevel ?? 1;
	return newGameInternal(seed, startLevel);
}

function tryRotate(
	state: GameState,
	direction: 1 | -1,
): ActivePiece | null {
	const a = state.active;
	if (!a) return null;
	const next = rotateBy(a.rotation, direction);
	const trans = transitionKey(a.rotation, next);
	if (!trans) return null;
	const kicks = getKickTable(a.type);
	const offsets = kicks ? kicks[trans] : [[0, 0]];
	for (const [dCol, dRow] of offsets) {
		const c = a.col + dCol;
		const r = a.row - dRow; // SRS Y-axis is up; our row grows down.
		if (canPlacePiece(state.board, a.type, next, c, r)) {
			return { type: a.type, rotation: next, col: c, row: r };
		}
	}
	return null;
}

/**
 * Pull the next piece from the bag and try to spawn it on the
 * current board. Returns either a fresh running state with the new
 * piece active, or a game-over state with active=null. This is the
 * dedicated spawn-collision detection point.
 */
export function spawnNextPiece(state: GameState): GameState {
	const consumed = consumeFromBag(state.bagQueue, state.bagSeed);
	const spawn = spawnPosition(consumed.piece);
	const canSpawn = canPlacePiece(
		state.board,
		spawn.type,
		spawn.rotation,
		spawn.col,
		spawn.row,
	);
	return {
		...state,
		active: canSpawn ? spawn : null,
		canHold: true,
		bagSeed: consumed.seed,
		bagQueue: consumed.queue,
		status: canSpawn ? state.status : "game-over",
	};
}

function lockAndAdvance(state: GameState): GameState {
	const a = state.active;
	if (!a) return state;
	const placed = placePiece(state.board, a.type, a.rotation, a.col, a.row);
	const cleared = clearAndCollapse(placed);
	const newLines = state.lines + cleared.count;
	const newLevel = levelFor(newLines, state.startLevel);
	const newScore =
		state.score +
		scoreForLines(cleared.count as 0 | 1 | 2 | 3 | 4, state.level);

	const afterClear: GameState = {
		...state,
		board: cleared.board,
		score: newScore,
		level: newLevel,
		lines: newLines,
		ticks: state.ticks + 1,
	};
	return spawnNextPiece(afterClear);
}

function applyTick(state: GameState): GameState {
	if (state.status !== "running" || !state.active) return state;
	const a = state.active;
	if (canMove(state.board, a.type, a.rotation, a.col, a.row, 0, 1)) {
		return {
			...state,
			active: { ...a, row: a.row + 1 },
			ticks: state.ticks + 1,
		};
	}
	return lockAndAdvance(state);
}

function applyMove(state: GameState, direction: -1 | 1): GameState {
	if (state.status !== "running" || !state.active) return state;
	const a = state.active;
	if (canMove(state.board, a.type, a.rotation, a.col, a.row, direction, 0)) {
		return { ...state, active: { ...a, col: a.col + direction } };
	}
	return state;
}

function applySoftDrop(state: GameState): GameState {
	// Soft-drop is "one cell now"; the gravity tick still runs separately.
	return applyTick(state);
}

function applyHardDrop(state: GameState): GameState {
	if (state.status !== "running" || !state.active) return state;
	const a = state.active;
	const drop = dropDistance(state.board, a.type, a.rotation, a.col, a.row);
	const lockRow = hardDropRow(state.board, a.type, a.rotation, a.col, a.row);
	const dropped: ActivePiece = { ...a, row: lockRow };
	const scoreBonus = drop * 2; // guideline: 2 pts per cell hard-dropped
	return lockAndAdvance({
		...state,
		active: dropped,
		score: state.score + scoreBonus,
	});
}

function applyRotate(state: GameState, direction: 1 | -1): GameState {
	if (state.status !== "running" || !state.active) return state;
	const rotated = tryRotate(state, direction);
	if (!rotated) return state;
	return { ...state, active: rotated };
}

function applyHold(state: GameState): GameState {
	if (state.status !== "running" || !state.active || !state.canHold) {
		return state;
	}
	const heldType = state.active.type;
	if (state.hold === null) {
		const consumed = consumeFromBag(state.bagQueue, state.bagSeed);
		return {
			...state,
			hold: heldType,
			canHold: false,
			active: spawnPosition(consumed.piece),
			bagSeed: consumed.seed,
			bagQueue: consumed.queue,
		};
	}
	return {
		...state,
		hold: heldType,
		canHold: false,
		active: spawnPosition(state.hold),
	};
}

function applyPause(state: GameState): GameState {
	if (state.status !== "running") return state;
	return { ...state, status: "paused" };
}

function applyResume(state: GameState): GameState {
	if (state.status !== "paused") return state;
	return { ...state, status: "running" };
}

function applyRestart(state: GameState): GameState {
	return newGameInternal(state.bagSeed, state.startLevel);
}

export function applyIntent(
	state: GameState,
	intent: Intent,
	now: number,
): GameState {
	const stamped = { ...state, lastIntentAt: now };
	switch (intent.kind) {
		case "tick":
			return { ...applyTick(stamped), lastIntentAt: now };
		case "move":
			return { ...applyMove(stamped, intent.direction), lastIntentAt: now };
		case "soft-drop":
			return { ...applySoftDrop(stamped), lastIntentAt: now };
		case "hard-drop":
			return { ...applyHardDrop(stamped), lastIntentAt: now };
		case "rotate":
			return { ...applyRotate(stamped, intent.direction), lastIntentAt: now };
		case "hold":
			return { ...applyHold(stamped), lastIntentAt: now };
		case "pause":
			return { ...applyPause(stamped), lastIntentAt: now };
		case "resume":
			return { ...applyResume(stamped), lastIntentAt: now };
		case "restart":
			return { ...applyRestart(stamped), lastIntentAt: now };
	}
}

/**
 * Convenience helper: flip paused ↔ running. Idempotent on game-over.
 * Equivalent to applyIntent with the appropriate intent, but the
 * UI calls this with no `now` argument since the toggle isn't
 * gameplay-state-dependent.
 */
export function togglePause(state: GameState): GameState {
	if (state.status === "running") return { ...state, status: "paused" };
	if (state.status === "paused") return { ...state, status: "running" };
	return state; // game-over: no-op (sticky)
}

/**
 * HUD helper: how many more line-clears until the next level. Thin
 * re-export of scoring.linesToNextLevel against the state's `lines`
 * field so the HUD has a single import.
 */
export function linesToNextLevel(state: GameState): number {
	return linesToNextLevelRaw(state.lines);
}

/**
 * Convenience helper: full game reset. Preserves startLevel by
 * default; seed defaults to the current bagSeed so successive
 * restarts naturally diverge instead of replaying the same game.
 */
export function restart(state: GameState, opts: NewGameOptions = {}): GameState {
	return newGame({
		seed: opts.seed ?? state.bagSeed,
		startLevel: opts.startLevel ?? state.startLevel,
	});
}

export const _internal = {
	BOARD_COLS,
	BOARD_ROWS,
	QUEUE_PREVIEW,
};
