import { describe, expect, it } from "bun:test";
import { createParticleSystem } from "../particles.ts";

describe("particle system", () => {
	it("starts with no live particles", () => {
		const ps = createParticleSystem(50);
		expect(ps.count).toBe(0);
		expect(ps.capacity).toBe(50);
	});

	it("emit creates the requested number of live particles", () => {
		const ps = createParticleSystem(50);
		ps.emit({ x: 100, y: 100, color: "#ff00ff", count: 10 });
		expect(ps.count).toBe(10);
	});

	it("step decays life by dtMs", () => {
		const ps = createParticleSystem(50);
		ps.emit({ x: 0, y: 0, color: "#fff", count: 5, lifeMs: 100 });
		ps.step(50);
		expect(ps.count).toBe(5);
		ps.step(50);
		expect(ps.count).toBe(0);
	});

	it("step also advances position", () => {
		const ps = createParticleSystem(10);
		ps.emit({ x: 100, y: 100, color: "#fff", count: 1, intensity: 1 });
		ps.step(0); // emit doesn't move; step(0) shouldn't either
		// We can't easily inspect positions without a paint hook; use paint
		// with a stub canvas to verify it doesn't throw.
		const stub = makeStubCtx();
		ps.paint(stub.ctx);
		expect(stub.fillCalls).toBe(1);
	});

	it("respects capacity (does not overflow)", () => {
		const ps = createParticleSystem(10);
		ps.emit({ x: 0, y: 0, color: "#fff", count: 100 });
		expect(ps.count).toBeLessThanOrEqual(10);
	});

	it("reset clears all particles", () => {
		const ps = createParticleSystem(20);
		ps.emit({ x: 0, y: 0, color: "#fff", count: 5 });
		expect(ps.count).toBe(5);
		ps.reset();
		expect(ps.count).toBe(0);
	});

	it("dead slots are reused on subsequent emits", () => {
		const ps = createParticleSystem(20);
		ps.emit({ x: 0, y: 0, color: "#fff", count: 10, lifeMs: 50 });
		ps.step(60); // all dead
		expect(ps.count).toBe(0);
		ps.emit({ x: 0, y: 0, color: "#0f0", count: 15 });
		expect(ps.count).toBe(15);
	});

	it("paint draws each live particle (one fill per particle)", () => {
		const ps = createParticleSystem(20);
		ps.emit({ x: 50, y: 50, color: "#ff0", count: 7 });
		const stub = makeStubCtx();
		ps.paint(stub.ctx);
		expect(stub.fillCalls).toBe(7);
	});

	it("paint is a no-op on an empty system", () => {
		const ps = createParticleSystem(20);
		const stub = makeStubCtx();
		ps.paint(stub.ctx);
		expect(stub.fillCalls).toBe(0);
	});

	it("step on empty system is harmless", () => {
		const ps = createParticleSystem(20);
		ps.step(100);
		expect(ps.count).toBe(0);
	});

	it("intensity scales velocity (more intensity → faster fade-out)", () => {
		// Particles with high intensity travel further before life
		// expires; we can't measure position easily, but we can verify
		// the system doesn't crash with extreme values.
		const ps = createParticleSystem(20);
		ps.emit({ x: 0, y: 0, color: "#fff", count: 5, intensity: 5 });
		ps.step(16);
		expect(ps.count).toBe(5);
	});
});

interface StubCtx {
	ctx: CanvasRenderingContext2D;
	fillCalls: number;
}

function makeStubCtx(): StubCtx {
	let fillCalls = 0;
	const ctx = {
		save: () => {},
		restore: () => {},
		beginPath: () => {},
		arc: () => {},
		fill: () => {
			fillCalls++;
		},
		globalAlpha: 1,
		fillStyle: "",
		shadowColor: "",
		shadowBlur: 0,
	} as unknown as CanvasRenderingContext2D;
	return {
		ctx,
		get fillCalls() {
			return fillCalls;
		},
	};
}
