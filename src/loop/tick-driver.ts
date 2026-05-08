/**
 * Deterministic logic-tick driver for the Tetris rule-step.
 *
 * motion.dev animations run on the browser's animation-frame
 * schedule, which is wall-clock variable. The rule-step (gravity,
 * rotate, lock, line-clear) must NOT inherit that variability — a
 * cancelled animation, a backgrounded tab, or a frame-budget
 * overrun must never desync game logic.
 *
 * The driver owns no DOM, no timers, no animation handles. The
 * caller injects elapsed time. That is what makes it deterministic
 * and unit-testable without happy-dom.
 */
export interface TickDriver {
	/** Consume elapsed wall-clock ms. Returns how many full logic ticks accrued. */
	advance(elapsedMs: number): number;
	/** Update cadence (e.g. on level-up). Accumulator is preserved. */
	setRate(msPerTick: number): void;
	/** Drop accumulator (use on game restart). */
	reset(): void;
	readonly msPerTick: number;
	readonly accumulatorMs: number;
}

export function createTickDriver(opts: { msPerTick: number }): TickDriver {
	if (!(opts.msPerTick > 0)) {
		throw new Error("msPerTick must be > 0");
	}
	let rate = opts.msPerTick;
	let acc = 0;
	return {
		advance(elapsedMs) {
			if (elapsedMs > 0) acc += elapsedMs;
			const ticks = Math.floor(acc / rate);
			acc -= ticks * rate;
			return ticks;
		},
		setRate(msPerTick) {
			if (!(msPerTick > 0)) throw new Error("msPerTick must be > 0");
			rate = msPerTick;
		},
		reset() {
			acc = 0;
		},
		get msPerTick() {
			return rate;
		},
		get accumulatorMs() {
			return acc;
		},
	};
}
