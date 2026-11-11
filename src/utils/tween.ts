/**
 Minimal property tween (sine in/out), used for smooth corrections of the bodies' rotations.
 Works without a browser (falls back on timers), so that simulations can run headless.
 */

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const nextFrame = (cb: () => void) => (typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame(cb) : setTimeout(cb, 16));

const active = new Map<object, Map<string, number>>();

function easeSineInOut(t: number) {
	return -(Math.cos(Math.PI * t) - 1) / 2;
}

/** animates obj[prop] to `to` in `duration` seconds. Starting a new tween on the same property replaces the previous one. */
export function tweenTo<T extends object, K extends keyof T & string>(obj: T, prop: K, to: number, duration: number) {
	const from = Number(obj[prop]) || 0;
	const start = now();
	const tweens = active.get(obj) ?? new Map<string, number>();
	active.set(obj, tweens);
	const id = (tweens.get(prop) ?? 0) + 1;
	tweens.set(prop, id);

	const step = () => {
		if (tweens.get(prop) !== id) return;
		const t = Math.min(1, (now() - start) / (duration * 1000));
		(obj[prop] as unknown as number) = from + (to - from) * easeSineInOut(t);
		if (t < 1) nextFrame(step);
	};
	nextFrame(step);
}
