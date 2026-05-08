/**
 * Scoring + level system per the Tetris guideline 2009.
 *
 * Base scores (× level multiplier):
 *   Single = 100, Double = 300, Triple = 500, Tetris = 800.
 *
 * Level increments after every 10 cumulative line-clears. The
 * starting level is customisable (default 1) so a "start at level 5"
 * mode is easy to add later.
 *
 * Pure functions — no game-state mutation.
 */

const BASE_SCORES: ReadonlyArray<number> = [0, 100, 300, 500, 800] as const;

export type LineClearKind = 0 | 1 | 2 | 3 | 4;

/**
 * Scoring for a clear of N lines at the given level. Tetris guideline
 * formula: BASE_SCORES[N] × max(1, level). Level is clamped at 1
 * (game-start) so a level-0 game still produces nonzero scores; the
 * official guideline does the same.
 */
export function scoreForLines(lines: number, level: number): number {
	if (lines < 0 || lines > 4 || !Number.isInteger(lines)) {
		throw new Error(
			`Invalid line-clear count: ${lines} (expected integer in [0..4])`,
		);
	}
	return (BASE_SCORES[lines] ?? 0) * Math.max(1, level);
}

/**
 * Compute the current level given total cumulative lines cleared.
 * Increment every 10. `startLevel` is the level at game-start (most
 * games start at 1).
 */
export function levelFor(totalLines: number, startLevel = 1): number {
	if (totalLines < 0) return startLevel;
	return startLevel + Math.floor(totalLines / 10);
}

/**
 * Lines required to reach the *next* level from the current
 * `totalLines`. Useful for HUD progress bars ("3/10 to next level").
 */
export function linesToNextLevel(totalLines: number): number {
	return 10 - (totalLines % 10);
}

const NAMES: ReadonlyArray<string> = ["", "Single", "Double", "Triple", "Tetris"];

export function lineClearName(lines: number): string {
	if (lines >= 0 && lines <= 4) return NAMES[lines] as string;
	return `${lines}-line clear`;
}
