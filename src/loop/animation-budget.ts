/**
 * Animation budget registry. When per-frame work overruns the
 * 16.67ms window, the game-loop calls dropDecorative() — and, on
 * sustained overrun, dropEssential() — to free animation capacity
 * before the rule-step starts skipping.
 *
 * Critical animations (line-clear sweep) are NEVER cancelled by
 * this registry. They have to play out for the player to read what
 * just happened. The caller can still cancel them directly via the
 * handle if it really has to.
 *
 * The registry is pure data — it stores handles, calls .cancel()
 * on them, and removes them from the active set. No DOM, no timers.
 */

export type AnimationPriority = "critical" | "essential" | "decorative";

export interface AnimationHandle {
	readonly id: string;
	readonly priority: AnimationPriority;
	cancel(): void;
}

export interface AnimationBudget {
	register(handle: AnimationHandle): void;
	unregister(id: string): void;
	/** Cancel every decorative-priority animation. Returns the cancelled handles. */
	dropDecorative(): AnimationHandle[];
	/** Cancel every essential-priority animation. Returns the cancelled handles. */
	dropEssential(): AnimationHandle[];
	reset(): void;
	readonly activeCount: number;
	readonly active: ReadonlyArray<AnimationHandle>;
}

export function createAnimationBudget(): AnimationBudget {
	const handles = new Map<string, AnimationHandle>();

	function dropByPriority(p: AnimationPriority): AnimationHandle[] {
		const dropped: AnimationHandle[] = [];
		for (const h of handles.values()) {
			if (h.priority === p) dropped.push(h);
		}
		for (const h of dropped) {
			handles.delete(h.id);
			h.cancel();
		}
		return dropped;
	}

	return {
		register(h) {
			handles.set(h.id, h);
		},
		unregister(id) {
			handles.delete(id);
		},
		dropDecorative() {
			return dropByPriority("decorative");
		},
		dropEssential() {
			return dropByPriority("essential");
		},
		reset() {
			handles.clear();
		},
		get activeCount() {
			return handles.size;
		},
		get active() {
			return Array.from(handles.values());
		},
	};
}
