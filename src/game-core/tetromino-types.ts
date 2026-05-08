/**
 * Tetromino types + SRS rotation tables.
 *
 * Implements the 7 standard tetrominoes (I, O, T, S, Z, J, L) with
 * all 4 rotation states (0, R, 2, L per Tetris guideline notation),
 * plus the SRS (Super Rotation System) wall-kick tables for both the
 * common J/L/S/T/Z group and the I-piece special-case.
 *
 * Pure data + tiny helpers — no DOM, no game state. Consumed by:
 * - board.ts (collision testing)
 * - gravity.ts (lock-down)
 * - render-and-motion (visual rendering)
 *
 * References:
 * - Tetris Guideline 2009 (color + rotation conventions)
 * - https://harddrop.com/wiki/SRS
 */

export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export const TETROMINO_TYPES: ReadonlyArray<TetrominoType> = [
	"I",
	"O",
	"T",
	"S",
	"Z",
	"J",
	"L",
] as const;

/** Rotation state per the Tetris guideline notation (0 / R / 2 / L). */
export type Rotation = 0 | 1 | 2 | 3;
export const ROTATIONS: ReadonlyArray<Rotation> = [0, 1, 2, 3] as const;

/**
 * A cell offset from the piece origin. The origin convention is the
 * top-left corner of the piece's bounding box; offsets are
 * `[col, row]` with `row` increasing downward (screen-space, NOT
 * Tetris-stack-space).
 */
export type CellOffset = readonly [col: number, row: number];

/**
 * Shape per rotation: the four filled cells of the tetromino, given
 * relative to the piece's pivot. Stored as 4 cells for every state.
 *
 * For O (no rotation), all four states are identical.
 */
export type RotationStates = readonly [
	zero: ReadonlyArray<CellOffset>,
	right: ReadonlyArray<CellOffset>,
	two: ReadonlyArray<CellOffset>,
	left: ReadonlyArray<CellOffset>,
];

/**
 * Full per-tetromino spec: shape per rotation + spawn col/row + the
 * canonical wall-kick group ("JLSTZ" or "I" — O has no kicks).
 */
export interface TetrominoSpec {
	readonly type: TetrominoType;
	readonly shapes: RotationStates;
	/** Standard guideline color (RGB hex). */
	readonly color: string;
	/** SRS spawn column for a 10-wide board (left-anchor of bbox). */
	readonly spawnCol: number;
	readonly kickGroup: "JLSTZ" | "I" | "O";
}

// ---------------------------------------------------------------------------
// Shape data — verified against the Tetris guideline.
//
// Each rotation lists the four filled cells (col, row) inside the piece
// bounding box; row 0 is the top of the box.
// ---------------------------------------------------------------------------

const I_SHAPES: RotationStates = [
	// 0 — flat horizontal, row 1 of a 4×4 box
	[
		[0, 1],
		[1, 1],
		[2, 1],
		[3, 1],
	],
	// R — vertical, col 2 of a 4×4 box
	[
		[2, 0],
		[2, 1],
		[2, 2],
		[2, 3],
	],
	// 2 — flat horizontal, row 2 of a 4×4 box
	[
		[0, 2],
		[1, 2],
		[2, 2],
		[3, 2],
	],
	// L — vertical, col 1 of a 4×4 box
	[
		[1, 0],
		[1, 1],
		[1, 2],
		[1, 3],
	],
];

const O_SHAPE_ALL: ReadonlyArray<CellOffset> = [
	[1, 0],
	[2, 0],
	[1, 1],
	[2, 1],
];
const O_SHAPES: RotationStates = [
	O_SHAPE_ALL,
	O_SHAPE_ALL,
	O_SHAPE_ALL,
	O_SHAPE_ALL,
];

const T_SHAPES: RotationStates = [
	[
		[1, 0],
		[0, 1],
		[1, 1],
		[2, 1],
	],
	[
		[1, 0],
		[1, 1],
		[2, 1],
		[1, 2],
	],
	[
		[0, 1],
		[1, 1],
		[2, 1],
		[1, 2],
	],
	[
		[1, 0],
		[0, 1],
		[1, 1],
		[1, 2],
	],
];

const S_SHAPES: RotationStates = [
	[
		[1, 0],
		[2, 0],
		[0, 1],
		[1, 1],
	],
	[
		[1, 0],
		[1, 1],
		[2, 1],
		[2, 2],
	],
	[
		[1, 1],
		[2, 1],
		[0, 2],
		[1, 2],
	],
	[
		[0, 0],
		[0, 1],
		[1, 1],
		[1, 2],
	],
];

const Z_SHAPES: RotationStates = [
	[
		[0, 0],
		[1, 0],
		[1, 1],
		[2, 1],
	],
	[
		[2, 0],
		[1, 1],
		[2, 1],
		[1, 2],
	],
	[
		[0, 1],
		[1, 1],
		[1, 2],
		[2, 2],
	],
	[
		[1, 0],
		[0, 1],
		[1, 1],
		[0, 2],
	],
];

const J_SHAPES: RotationStates = [
	[
		[0, 0],
		[0, 1],
		[1, 1],
		[2, 1],
	],
	[
		[1, 0],
		[2, 0],
		[1, 1],
		[1, 2],
	],
	[
		[0, 1],
		[1, 1],
		[2, 1],
		[2, 2],
	],
	[
		[1, 0],
		[1, 1],
		[0, 2],
		[1, 2],
	],
];

const L_SHAPES: RotationStates = [
	[
		[2, 0],
		[0, 1],
		[1, 1],
		[2, 1],
	],
	[
		[1, 0],
		[1, 1],
		[1, 2],
		[2, 2],
	],
	[
		[0, 1],
		[1, 1],
		[2, 1],
		[0, 2],
	],
	[
		[0, 0],
		[1, 0],
		[1, 1],
		[1, 2],
	],
];

export const TETROMINOES: { readonly [K in TetrominoType]: TetrominoSpec } = {
	I: { type: "I", shapes: I_SHAPES, color: "#00f0f0", spawnCol: 3, kickGroup: "I" },
	O: { type: "O", shapes: O_SHAPES, color: "#f0f000", spawnCol: 3, kickGroup: "O" },
	T: { type: "T", shapes: T_SHAPES, color: "#a000f0", spawnCol: 3, kickGroup: "JLSTZ" },
	S: { type: "S", shapes: S_SHAPES, color: "#00f000", spawnCol: 3, kickGroup: "JLSTZ" },
	Z: { type: "Z", shapes: Z_SHAPES, color: "#f00000", spawnCol: 3, kickGroup: "JLSTZ" },
	J: { type: "J", shapes: J_SHAPES, color: "#0000f0", spawnCol: 3, kickGroup: "JLSTZ" },
	L: { type: "L", shapes: L_SHAPES, color: "#f0a000", spawnCol: 3, kickGroup: "JLSTZ" },
};

// ---------------------------------------------------------------------------
// SRS kick tables — offsets to TRY in order when a rotation collides.
// Source: https://harddrop.com/wiki/SRS#Wall_Kicks
//
// The keys are "from→to" rotation transitions ("0->R", "R->2", etc.).
// Each value is 4 fallback offsets (the rotation's own position is
// the implicit 0-th try; consumers iterate kicks until one fits or
// all fail → rotation is rejected).
// ---------------------------------------------------------------------------

export type KickTransition =
	| "0->R"
	| "R->0"
	| "R->2"
	| "2->R"
	| "2->L"
	| "L->2"
	| "L->0"
	| "0->L";

export type KickTable = { readonly [K in KickTransition]: ReadonlyArray<CellOffset> };

/** Common kick table for J, L, S, T, Z. */
export const JLSTZ_KICKS: KickTable = {
	"0->R": [
		[-1, 0],
		[-1, 1],
		[0, -2],
		[-1, -2],
	],
	"R->0": [
		[1, 0],
		[1, -1],
		[0, 2],
		[1, 2],
	],
	"R->2": [
		[1, 0],
		[1, -1],
		[0, 2],
		[1, 2],
	],
	"2->R": [
		[-1, 0],
		[-1, 1],
		[0, -2],
		[-1, -2],
	],
	"2->L": [
		[1, 0],
		[1, 1],
		[0, -2],
		[1, -2],
	],
	"L->2": [
		[-1, 0],
		[-1, -1],
		[0, 2],
		[-1, 2],
	],
	"L->0": [
		[-1, 0],
		[-1, -1],
		[0, 2],
		[-1, 2],
	],
	"0->L": [
		[1, 0],
		[1, 1],
		[0, -2],
		[1, -2],
	],
};

/** Special kick table for the I-piece. */
export const I_KICKS: KickTable = {
	"0->R": [
		[-2, 0],
		[1, 0],
		[-2, -1],
		[1, 2],
	],
	"R->0": [
		[2, 0],
		[-1, 0],
		[2, 1],
		[-1, -2],
	],
	"R->2": [
		[-1, 0],
		[2, 0],
		[-1, 2],
		[2, -1],
	],
	"2->R": [
		[1, 0],
		[-2, 0],
		[1, -2],
		[-2, 1],
	],
	"2->L": [
		[2, 0],
		[-1, 0],
		[2, 1],
		[-1, -2],
	],
	"L->2": [
		[-2, 0],
		[1, 0],
		[-2, -1],
		[1, 2],
	],
	"L->0": [
		[1, 0],
		[-2, 0],
		[1, -2],
		[-2, 1],
	],
	"0->L": [
		[-1, 0],
		[2, 0],
		[-1, 2],
		[2, -1],
	],
};

/** Resolve the kick table for a tetromino's group. O has none. */
export function getKickTable(t: TetrominoType): KickTable | null {
	const spec = TETROMINOES[t];
	if (spec.kickGroup === "O") return null;
	if (spec.kickGroup === "I") return I_KICKS;
	return JLSTZ_KICKS;
}

/** Resolve the cells of a tetromino at the given rotation. */
export function shapeOf(t: TetrominoType, rot: Rotation): ReadonlyArray<CellOffset> {
	return TETROMINOES[t].shapes[rot];
}

/**
 * Encode a (from, to) rotation transition as a key into the kick
 * table. `to = (from + dir) % 4` where `dir` is +1 (clockwise) or
 * -1 (counter-clockwise).
 */
export function transitionKey(from: Rotation, to: Rotation): KickTransition | null {
	const map: Record<string, KickTransition> = {
		"0,1": "0->R",
		"1,0": "R->0",
		"1,2": "R->2",
		"2,1": "2->R",
		"2,3": "2->L",
		"3,2": "L->2",
		"3,0": "L->0",
		"0,3": "0->L",
	};
	return map[`${from},${to}`] ?? null;
}

/** Rotate a rotation index by ±1, wrapping at 4. */
export function rotateBy(rot: Rotation, dir: 1 | -1): Rotation {
	return (((rot + dir) % 4) + 4) % 4 as Rotation;
}
