/**
 * Per-frame budget profiler. Records logic-tick ms + render ms each
 * frame and produces an avg / p95 / max summary plus a CSV dump.
 *
 * Mitigates risk-motion-vs-fps by giving the developer a measurable
 * target. Wire enabled to a dev flag (e.g. import.meta.env.DEV in
 * Vite) so the production build pays nothing.
 *
 * The profiler is intentionally pure-data — it owns no timers and
 * does not call performance.now() itself. The caller measures and
 * reports. That keeps the profiler unit-testable without DOM and
 * without monkey-patching globals.
 */

export interface FrameSample {
	readonly logicMs: number;
	readonly renderMs: number;
}

export interface PhaseStats {
	readonly count: number;
	readonly avg: number;
	readonly p95: number;
	readonly max: number;
}

export interface ProfilerSummary {
	readonly samples: number;
	readonly logic: PhaseStats;
	readonly render: PhaseStats;
	readonly total: PhaseStats;
}

export interface FrameBudgetProfiler {
	readonly enabled: boolean;
	recordFrame(sample: FrameSample): void;
	summary(): ProfilerSummary | null;
	toCSV(): string;
	reset(): void;
	readonly sampleCount: number;
}

export interface ProfilerOptions {
	enabled?: boolean;
	/** Cap retained samples (oldest dropped). 0 = unbounded. */
	maxSamples?: number;
}

const ZERO_STATS: PhaseStats = { count: 0, avg: 0, p95: 0, max: 0 };

export function createFrameBudgetProfiler(
	opts: ProfilerOptions = {},
): FrameBudgetProfiler {
	const enabled = opts.enabled ?? false;
	const cap = opts.maxSamples ?? 0;
	const logic: number[] = [];
	const render: number[] = [];

	function record(sample: FrameSample) {
		if (!enabled) return;
		logic.push(sample.logicMs);
		render.push(sample.renderMs);
		if (cap > 0 && logic.length > cap) {
			logic.shift();
			render.shift();
		}
	}

	function stats(values: number[]): PhaseStats {
		if (values.length === 0) return ZERO_STATS;
		const sorted = [...values].sort((a, b) => a - b);
		const sum = sorted.reduce((a, b) => a + b, 0);
		const avg = sum / sorted.length;
		const p95Index = Math.min(
			sorted.length - 1,
			Math.ceil(sorted.length * 0.95) - 1,
		);
		const p95 = sorted[Math.max(0, p95Index)] ?? 0;
		const max = sorted[sorted.length - 1] ?? 0;
		return { count: sorted.length, avg, p95, max };
	}

	return {
		get enabled() {
			return enabled;
		},
		get sampleCount() {
			return logic.length;
		},
		recordFrame: record,
		summary() {
			if (logic.length === 0) return null;
			const total = logic.map((l, i) => l + (render[i] ?? 0));
			return {
				samples: logic.length,
				logic: stats(logic),
				render: stats(render),
				total: stats(total),
			};
		},
		toCSV() {
			const header = "frame,logic_ms,render_ms,total_ms";
			const rows = logic.map((l, i) => {
				const r = render[i] ?? 0;
				return `${i},${l},${r},${l + r}`;
			});
			return [header, ...rows].join("\n");
		},
		reset() {
			logic.length = 0;
			render.length = 0;
		},
	};
}
