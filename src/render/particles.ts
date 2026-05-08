/**
 * Lightweight 2D particle system. Pure data — caller drives the
 * step/paint loop with their own RAF clock and canvas context.
 *
 * The system maintains a fixed-capacity circular buffer of slots.
 * `emit()` writes new particles; `step(dtMs)` advances physics +
 * decays life; `paint(ctx)` blits each live particle as a glowing
 * disc. When a slot's life reaches 0 it's marked dead and reused.
 */

export interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	maxLife: number;
	color: string;
	size: number;
}

export interface EmitOptions {
	x: number;
	y: number;
	color: string;
	count: number;
	intensity?: number; // velocity scalar (default 1)
	lifeMs?: number; // default 600
}

export interface ParticleSystem {
	emit(opts: EmitOptions): void;
	step(dtMs: number): void;
	paint(ctx: CanvasRenderingContext2D): void;
	reset(): void;
	readonly count: number;
	readonly capacity: number;
}

const GRAVITY_PX_PER_MS2 = 0.0006;

export function createParticleSystem(capacity = 400): ParticleSystem {
	const slots: Particle[] = new Array(capacity);
	for (let i = 0; i < capacity; i++) {
		slots[i] = {
			x: 0,
			y: 0,
			vx: 0,
			vy: 0,
			life: 0,
			maxLife: 1,
			color: "#fff",
			size: 0,
		};
	}
	let writeIndex = 0;

	function nextSlot(): Particle {
		// Find the first dead slot from writeIndex; if all alive, evict
		// oldest (overwrite at writeIndex).
		for (let i = 0; i < capacity; i++) {
			const idx = (writeIndex + i) % capacity;
			if ((slots[idx] as Particle).life <= 0) {
				writeIndex = (idx + 1) % capacity;
				return slots[idx] as Particle;
			}
		}
		const slot = slots[writeIndex] as Particle;
		writeIndex = (writeIndex + 1) % capacity;
		return slot;
	}

	return {
		emit(opts) {
			const intensity = opts.intensity ?? 1;
			const life = opts.lifeMs ?? 600;
			for (let i = 0; i < opts.count; i++) {
				const p = nextSlot();
				const angle = Math.random() * Math.PI * 2;
				const speed = (0.05 + Math.random() * 0.25) * intensity;
				p.x = opts.x;
				p.y = opts.y;
				p.vx = Math.cos(angle) * speed;
				p.vy = Math.sin(angle) * speed - 0.1 * intensity;
				p.life = life;
				p.maxLife = life;
				p.color = opts.color;
				p.size = 2 + Math.random() * 3;
			}
		},
		step(dtMs) {
			for (const p of slots) {
				if (p.life <= 0) continue;
				p.x += p.vx * dtMs;
				p.y += p.vy * dtMs;
				p.vy += GRAVITY_PX_PER_MS2 * dtMs;
				p.life -= dtMs;
			}
		},
		paint(ctx) {
			ctx.save();
			for (const p of slots) {
				if (p.life <= 0) continue;
				const t = p.life / p.maxLife;
				const alpha = Math.max(0, Math.min(1, t));
				ctx.globalAlpha = alpha;
				ctx.fillStyle = p.color;
				ctx.shadowColor = p.color;
				ctx.shadowBlur = 8;
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size * (0.6 + 0.4 * t), 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();
		},
		reset() {
			for (const p of slots) {
				p.life = 0;
			}
			writeIndex = 0;
		},
		get count() {
			let n = 0;
			for (const p of slots) if (p.life > 0) n++;
			return n;
		},
		get capacity() {
			return capacity;
		},
	};
}
