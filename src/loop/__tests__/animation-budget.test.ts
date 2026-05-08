import { describe, expect, it } from "bun:test";
import {
	type AnimationHandle,
	type AnimationPriority,
	createAnimationBudget,
} from "../animation-budget.ts";

function makeHandle(
	id: string,
	priority: AnimationPriority,
): AnimationHandle & { cancelled: boolean } {
	const h = {
		id,
		priority,
		cancelled: false,
		cancel() {
			this.cancelled = true;
		},
	};
	return h;
}

describe("animation-budget", () => {
	it("starts empty", () => {
		const b = createAnimationBudget();
		expect(b.activeCount).toBe(0);
		expect(b.active).toEqual([]);
	});

	it("register + unregister tracks active count", () => {
		const b = createAnimationBudget();
		b.register(makeHandle("a", "decorative"));
		b.register(makeHandle("b", "essential"));
		expect(b.activeCount).toBe(2);
		b.unregister("a");
		expect(b.activeCount).toBe(1);
	});

	it("dropDecorative cancels every decorative and leaves the rest", () => {
		const b = createAnimationBudget();
		const lockFlash = makeHandle("lock-flash", "decorative");
		const trail = makeHandle("hard-drop-trail", "decorative");
		const pieceTween = makeHandle("piece-tween", "essential");
		const sweep = makeHandle("line-clear-sweep", "critical");
		b.register(lockFlash);
		b.register(trail);
		b.register(pieceTween);
		b.register(sweep);

		const dropped = b.dropDecorative();

		expect(dropped.map((h) => h.id).sort()).toEqual([
			"hard-drop-trail",
			"lock-flash",
		]);
		expect(lockFlash.cancelled).toBe(true);
		expect(trail.cancelled).toBe(true);
		expect(pieceTween.cancelled).toBe(false);
		expect(sweep.cancelled).toBe(false);
		expect(b.activeCount).toBe(2);
	});

	it("dropEssential cancels every essential, never touches critical", () => {
		const b = createAnimationBudget();
		const pieceTween = makeHandle("piece-tween", "essential");
		const sweep = makeHandle("line-clear-sweep", "critical");
		b.register(pieceTween);
		b.register(sweep);

		const dropped = b.dropEssential();

		expect(dropped.map((h) => h.id)).toEqual(["piece-tween"]);
		expect(pieceTween.cancelled).toBe(true);
		expect(sweep.cancelled).toBe(false);
		expect(b.activeCount).toBe(1);
	});

	it("critical animations are never cancelled by drop methods", () => {
		const b = createAnimationBudget();
		const sweep1 = makeHandle("sweep-1", "critical");
		const sweep2 = makeHandle("sweep-2", "critical");
		b.register(sweep1);
		b.register(sweep2);
		expect(b.dropDecorative()).toEqual([]);
		expect(b.dropEssential()).toEqual([]);
		expect(sweep1.cancelled).toBe(false);
		expect(sweep2.cancelled).toBe(false);
		expect(b.activeCount).toBe(2);
	});

	it("dropDecorative on an empty registry returns []", () => {
		const b = createAnimationBudget();
		expect(b.dropDecorative()).toEqual([]);
		expect(b.dropEssential()).toEqual([]);
	});

	it("registering same id twice replaces the old handle", () => {
		const b = createAnimationBudget();
		const first = makeHandle("h", "decorative");
		const second = makeHandle("h", "essential");
		b.register(first);
		b.register(second);
		expect(b.activeCount).toBe(1);
		// dropDecorative must NOT cancel `first` (it was replaced)
		const dropped = b.dropDecorative();
		expect(dropped).toEqual([]);
		expect(first.cancelled).toBe(false);
		// dropEssential cancels the replacement
		const dropped2 = b.dropEssential();
		expect(dropped2.map((h) => h.id)).toEqual(["h"]);
		expect(second.cancelled).toBe(true);
	});

	it("reset() clears active without cancelling anything", () => {
		const b = createAnimationBudget();
		const h = makeHandle("a", "decorative");
		b.register(h);
		b.reset();
		expect(b.activeCount).toBe(0);
		expect(h.cancelled).toBe(false);
	});

	it("escalation scenario: drop decoratives, then essentials, sweep survives", () => {
		const b = createAnimationBudget();
		const flash = makeHandle("flash", "decorative");
		const trail = makeHandle("trail", "decorative");
		const piece = makeHandle("piece", "essential");
		const ghost = makeHandle("ghost", "essential");
		const sweep = makeHandle("sweep", "critical");
		b.register(flash);
		b.register(trail);
		b.register(piece);
		b.register(ghost);
		b.register(sweep);

		// Frame N: mild overrun → drop decoratives
		const round1 = b.dropDecorative();
		expect(round1.length).toBe(2);
		expect(b.activeCount).toBe(3);

		// Frame N+1: still over → escalate
		const round2 = b.dropEssential();
		expect(round2.length).toBe(2);
		expect(b.activeCount).toBe(1);
		expect(b.active[0]?.id).toBe("sweep");
		expect(sweep.cancelled).toBe(false);
	});

	it("active array is a snapshot, not a live view", () => {
		const b = createAnimationBudget();
		b.register(makeHandle("a", "decorative"));
		const snap = b.active;
		b.register(makeHandle("b", "decorative"));
		expect(snap.length).toBe(1);
		expect(b.activeCount).toBe(2);
	});
});
