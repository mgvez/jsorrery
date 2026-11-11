import type { GeoLoc } from '../utils/GeoCoord';

export interface SelectOption {
	value: string;
	label: string;
}

export interface ScenarioSummary {
	name: string;
	title: string;
	/** html */
	help: string;
}

export interface Range {
	min: number;
	max: number;
	step?: number;
}

/** State of the GUI, written by the engine, read by React components */
export interface GuiState {
	scenarios: ScenarioSummary[];
	scenario: string | null;
	/** a scenario is being loaded (the preloader is shown) */
	loading: boolean;
	error: string | null;
	playing: boolean;
	/** current date of the simulation */
	date: Date | null;
	lookFrom: string;
	lookAt: string;
	lookFromOptions: SelectOption[];
	lookAtOptions: SelectOption[];
	planetScale: number;
	planetScaleRange: Range;
	/** seconds of simulation per animation frame */
	deltaT: number;
	deltaTRange: Range | null;
	/** observer's position on a body's surface, when the camera is placed on a body that supports it */
	geoloc: GeoLoc | null;
}

export const initialGuiState: GuiState = {
	scenarios: [],
	scenario: null,
	loading: true,
	error: null,
	playing: false,
	date: null,
	lookFrom: '',
	lookAt: '',
	lookFromOptions: [],
	lookAtOptions: [],
	planetScale: 10,
	planetScaleRange: { min: 1, max: 100, step: 1 },
	deltaT: 1,
	deltaTRange: null,
	geoloc: null,
};
