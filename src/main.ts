/**
 * fancy-tetris main entry. Composes the modules built across the
 * project-office plan into a single playable game loop.
 *
 *   keyboard → handleKey → Intent
 *   das-arr → repeated move Intents while held
 *   tick-driver → gravity ticks
 *   applyIntent → next state
 *   renderBoard + renderPiece + ghost + animations → DOM
 *   queue + hold previews → side panels
 */

import { msPerCell } from "./game-core/gravity.ts";
import {
	type ActivePiece,
	type GameState,
	type Intent,
	applyIntent,
	linesToNextLevel,
	newGame,
} from "./game-core/game-state.ts";
import { shapeOf } from "./game-core/tetromino-types.ts";
import { createDasArrState, type DasArrState, tickDas } from "./input/das-arr.ts";
import { handleKey } from "./input/keyboard-handler.ts";
import { animateLineClear } from "./render/line-clear-sweep.ts";
import { animateLockFlash } from "./render/lock-flash.ts";
import { renderBoard } from "./render/cell-rendering.ts";
import { createPlayfield, type Playfield } from "./render/dom-playfield.ts";
import { clearPieceOverlay, renderPiece } from "./render/piece-renderer.ts";
import { clearGhostPiece, renderGhost } from "./render/ghost-piece.ts";
import {
	createQueuePreview,
	paintQueue,
	type QueuePreview,
} from "./render/queue-preview.ts";
import {
	createHoldPreview,
	paintHold,
	type HoldPreview,
} from "./render/hold-preview.ts";
import { createTickDriver, type TickDriver } from "./loop/tick-driver.ts";

interface Hud {
	readonly root: HTMLElement;
	readonly score: HTMLElement;
	readonly level: HTMLElement;
	readonly lines: HTMLElement;
	readonly status: HTMLElement;
}

function makeStat(parent: HTMLElement, label: string): HTMLElement {
	const wrap = document.createElement("div");
	wrap.classList.add("tetris-hud-stat");
	const k = document.createElement("span");
	k.classList.add("tetris-hud-stat-label");
	k.textContent = label;
	const v = document.createElement("span");
	v.classList.add("tetris-hud-stat-value");
	wrap.appendChild(k);
	wrap.appendChild(v);
	parent.appendChild(wrap);
	return v;
}

function buildHud(parent: HTMLElement): Hud {
	const root = document.createElement("div");
	root.classList.add("tetris-hud");
	const score = makeStat(root, "Score");
	const level = makeStat(root, "Level");
	const lines = makeStat(root, "Lines");
	const status = makeStat(root, "Status");
	parent.appendChild(root);
	return { root, score, level, lines, status };
}

function paintHud(hud: Hud, state: GameState): void {
	hud.score.textContent = state.score.toLocaleString();
	hud.level.textContent = String(state.level);
	hud.lines.textContent = `${state.lines} (+${linesToNextLevel(state)})`;
	const labels: Record<GameState["status"], string> = {
		running: "playing",
		paused: "paused",
		"game-over": "GAME OVER",
	};
	hud.status.textContent = labels[state.status];
	hud.status.classList.remove(
		"tetris-status-running",
		"tetris-status-paused",
		"tetris-status-game-over",
	);
	hud.status.classList.add(`tetris-status-${state.status}`);
}

function activePieceCellCoords(
	piece: ActivePiece,
): ReadonlyArray<readonly [number, number]> {
	const offsets = shapeOf(piece.type, piece.rotation);
	return offsets.map(
		([dCol, dRow]) =>
			[piece.col + dCol, piece.row + dRow] as readonly [number, number],
	);
}

function countFilled(board: GameState["board"]): number {
	let n = 0;
	for (const row of board) {
		for (const c of row) if (c !== null) n++;
	}
	return n;
}

interface Wiring {
	readonly shell: HTMLElement;
	readonly hud: Hud;
	readonly playfield: Playfield;
	readonly queue: QueuePreview;
	readonly hold: HoldPreview;
	readonly tick: TickDriver;
	das: DasArrState;
	heldKeys: Map<string, true>;
	state: GameState;
	prevBoardFilled: number;
}

function paint(w: Wiring): void {
	renderBoard(w.playfield, w.state.board);
	if (w.state.active) {
		renderGhost(
			w.playfield,
			w.state.board,
			w.state.active.type,
			w.state.active.rotation,
			w.state.active.col,
			w.state.active.row,
		);
		renderPiece(
			w.playfield,
			w.state.active.type,
			w.state.active.rotation,
			w.state.active.col,
			w.state.active.row,
		);
	} else {
		clearGhostPiece(w.playfield);
		clearPieceOverlay(w.playfield);
	}
	paintHud(w.hud, w.state);
	paintQueue(w.queue, w.state.bagQueue.slice(0, 5));
	paintHold(w.hold, w.state.hold);
}

function dispatch(w: Wiring, intent: Intent | null, now: number): void {
	if (!intent) return;
	const before = w.state;
	const after = applyIntent(before, intent, now);
	w.state = after;

	if (before.active && countFilled(after.board) > w.prevBoardFilled) {
		const cells = activePieceCellCoords(before.active);
		animateLockFlash(w.playfield, cells, { durationMs: 200 });
	}

	const linesDelta = after.lines - before.lines;
	if (linesDelta > 0) {
		const rows = Array.from({ length: linesDelta }, (_, i) => 19 - i);
		animateLineClear(w.playfield, rows, { durationMs: 250 });
	}

	w.prevBoardFilled = countFilled(after.board);
}

function setupKeyboard(w: Wiring): () => void {
	const onKeyDown = (event: KeyboardEvent) => {
		if (event.repeat) return;
		w.heldKeys.set(event.code, true);
		const intent = handleKey(event, w.state);
		if (intent) {
			event.preventDefault();
			dispatch(w, intent, performance.now());
			paint(w);
		}
	};
	const onKeyUp = (event: KeyboardEvent) => {
		w.heldKeys.delete(event.code);
	};
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
	return () => {
		window.removeEventListener("keydown", onKeyDown);
		window.removeEventListener("keyup", onKeyUp);
	};
}

function dasMoveIntent(w: Wiring): Intent | null {
	if (w.heldKeys.has("ArrowLeft")) return { kind: "move", direction: -1 };
	if (w.heldKeys.has("ArrowRight")) return { kind: "move", direction: 1 };
	return null;
}

function startGameLoop(w: Wiring): () => void {
	let last = performance.now();
	let cancelled = false;
	const frame = (now: number) => {
		if (cancelled) return;
		const elapsed = now - last;
		last = now;

		const moveIntent = dasMoveIntent(w);
		const isMoveHeld = moveIntent !== null;
		const dasResult = tickDas(w.das, now, isMoveHeld);
		w.das = dasResult.state;
		if (dasResult.shouldFire && moveIntent) {
			dispatch(w, moveIntent, now);
		}

		w.tick.setRate(msPerCell(w.state.level));
		const ticks = w.tick.advance(elapsed);
		for (let i = 0; i < ticks; i++) {
			if (w.state.status !== "running") break;
			dispatch(w, { kind: "tick" }, now);
		}

		paint(w);
		requestAnimationFrame(frame);
	};
	requestAnimationFrame(frame);
	return () => {
		cancelled = true;
	};
}

function buildShell(parent: HTMLElement): HTMLElement {
	parent.textContent = "";
	const shell = document.createElement("div");
	shell.classList.add("tetris-shell");
	parent.appendChild(shell);
	return shell;
}

export function bootstrap(parent: HTMLElement, seed?: number): () => void {
	const shell = buildShell(parent);
	// Build columns in the right grid-areas: hold | board | queue.
	// HUD sits above on its own row spanning the board column.
	const hudWrap = document.createElement("div");
	hudWrap.style.gridArea = "hud";
	hudWrap.style.gridColumn = "hold / queue";
	const hud = buildHud(hudWrap);
	const hold = createHoldPreview(shell);
	const playfield = createPlayfield(shell);
	const queue = createQueuePreview(shell);
	shell.insertBefore(hudWrap, hold.root);
	// Adjust grid-template so HUD row sits above board row.
	shell.style.gridTemplateAreas = '"hud hud hud" "hold board queue"';
	shell.style.gridTemplateRows = "auto auto";

	const state = newGame({ seed });
	const w: Wiring = {
		shell,
		hud,
		playfield,
		queue,
		hold,
		tick: createTickDriver({ msPerTick: msPerCell(state.level) }),
		das: createDasArrState(),
		heldKeys: new Map(),
		state,
		prevBoardFilled: countFilled(state.board),
	};
	paint(w);
	const stopKeyboard = setupKeyboard(w);
	const stopLoop = startGameLoop(w);
	return () => {
		stopKeyboard();
		stopLoop();
	};
}

// Auto-mount when running as the page entry. Tests import bootstrap
// directly and pass a host with `data-test-mount="true"`.
const app = document.querySelector<HTMLDivElement>("#app");
if (app && !app.hasAttribute("data-test-mount")) {
	bootstrap(app);
}
