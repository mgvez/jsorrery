import { createContext, useContext, useSyncExternalStore } from 'react';
import type Orrery from '../core/Orrery';
import type { GuiState } from '../state/types';

export const OrreryContext = createContext<Orrery | null>(null);

export function useOrrery() {
	const orrery = useContext(OrreryContext);
	if (!orrery) throw new Error('useOrrery must be used inside an OrreryContext provider');
	return orrery;
}

/** subscribes to a slice of the GUI state. The selector must return a primitive or a stable reference. */
export function useGuiState<T>(selector: (state: GuiState) => T): T {
	const { store } = useOrrery();
	return useSyncExternalStore(store.subscribe, () => selector(store.getState()));
}
