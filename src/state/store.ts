/**
 Minimal external store, to be consumed by React with useSyncExternalStore.
 The simulation engine writes to it; components subscribe to the slices they need.
 */
export interface Store<S> {
	getState(): S;
	setState(partial: Partial<S> | ((state: S) => Partial<S>)): void;
	subscribe(listener: () => void): () => void;
}

export function createStore<S extends object>(initialState: S): Store<S> {
	let state = initialState;
	const listeners = new Set<() => void>();

	return {
		getState: () => state,
		setState(partial) {
			const changes = typeof partial === 'function' ? partial(state) : partial;
			const changed = (Object.keys(changes) as (keyof S)[]).some(key => !Object.is(changes[key], state[key]));
			if (!changed) return;
			state = { ...state, ...changes };
			listeners.forEach(listener => listener());
		},
		subscribe(listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
	};
}
