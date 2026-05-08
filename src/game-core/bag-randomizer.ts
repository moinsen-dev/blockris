/**
 * 7-bag tetromino randomizer (Tetris guideline 2009).
 *
 * Each "bag" contains exactly one of each of the 7 tetromino types
 * (I, O, T, S, Z, J, L) in shuffled order. When the bag is empty
 * we refill with a fresh shuffle. This guarantees no piece appears
 * more than 12 times before its next appearance — fairer than naive
 * Math.random() at the cost of a 7-cycle period.
 *
 * The randomizer takes a seed so reproducible test sequences are
 * possible. Pass `Date.now()` for "real" randomness in production.
 */

import { TETROMINO_TYPES, type TetrominoType } from "./tetromino-types.ts";

/**
 * Mulberry32 PRNG. Seedable, fast, "good enough" for a Tetris
 * randomizer (no cryptographic claims). Returns a function that
 * produces values in [0, 1).
 *
 * Source: https://en.wikipedia.org/wiki/List_of_random_number_generators
 *  → Mulberry32 — public domain.
 */
export function mulberry32(seed: number): () => number {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Fisher-Yates shuffle, returns a new array — does not mutate input. */
export function shuffle<T>(items: ReadonlyArray<T>, rand: () => number): T[] {
	const out = [...items];
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		const tmp = out[i] as T;
		out[i] = out[j] as T;
		out[j] = tmp;
	}
	return out;
}

/** Shuffle the 7 tetromino types into a fresh bag. */
export function newBag(rand: () => number): TetrominoType[] {
	return shuffle(TETROMINO_TYPES, rand);
}

/**
 * Stateful 7-bag randomizer. Call `next()` to pull the next piece;
 * the bag refills automatically every 7 pieces.
 */
export class BagRandomizer {
	private readonly rand: () => number;
	private current: TetrominoType[] = [];

	constructor(seed: number) {
		this.rand = mulberry32(seed);
		this.refill();
	}

	private refill(): void {
		this.current.push(...newBag(this.rand));
	}

	/** Pull the next piece. */
	next(): TetrominoType {
		if (this.current.length === 0) this.refill();
		return this.current.shift() as TetrominoType;
	}

	/** Peek the next n pieces without advancing — useful for the next-piece HUD. */
	peek(n: number): TetrominoType[] {
		while (this.current.length < n) this.refill();
		return this.current.slice(0, n);
	}
}
