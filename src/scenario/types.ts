import type { Color, Euler, Vector3 } from 'three';
import type CelestialBody from '../core/CelestialBody';

/**
 Keplerian elements, as found in the scenario files. Angles are in degrees, distances in km (a), unless otherwise specified.

	a 	Semi-major axis
	e 	Eccentricity
	i 	Inclination
	o 	Longitude of Ascending Node (Ω)
	w 	Argument of periapsis (ω)
	M	Mean anomaly
	l 	Mean Longitude
	lp	longitude of periapsis
 */
export interface OrbitalElementsSet {
	a?: number;
	e?: number;
	i?: number;
	o?: number;
	w?: number;
	M?: number;
	l?: number;
	lp?: number;
}

export interface OrbitDefinition extends OrbitalElementsSet {
	/** Julian date of the elements. J2000 if not specified. */
	epoch?: number;
	/** set to false to orient the orbit relative to the universe instead of relative to the parent body's tilt */
	tilt?: boolean;
	/** elements at epoch */
	base?: OrbitalElementsSet;
	/** variation of the elements per century */
	cy?: OrbitalElementsSet;
	/** variation of the elements per day */
	day?: OrbitalElementsSet;
	/** cache of the base element names */
	keys?: (keyof OrbitalElementsSet)[];
}

/** Elements as computed for a given date. Angles in radians, a in meters. */
export interface ComputedElements extends Required<Pick<OrbitalElementsSet, 'a' | 'e' | 'i' | 'o' | 'w' | 'M'>> {
	t?: number;
	l?: number;
	lp?: number;
	E: number;
	pos: Vector3;
	r: number | null;
	v: number | null;
	tilt?: number;
	isDbg?: boolean;
}

/** computes osculating elements (degrees, a in m) from T, in centuries since J2000 */
export type OsculatingElementsCalculator = (T: number) => OrbitalElementsSet;
/** computes a precise position (in m) from a julian date */
export type PositionCalculator = (jd: number) => Vector3;

export interface RingDefinition {
	innerRadius: number;
	outerRadius: number;
	map: string;
}

/** Hooks that scenario files can define on a body. `this` is the body itself. */
export interface BodyHooks {
	customInitialize?(this: CelestialBody): void;
	customAfterTick?(this: CelestialBody, deltaT: number): void;
	getRotationCorrection?(this: CelestialBody): number;
	getTilt?(this: CelestialBody, xCorrection?: number): Euler;
	getMapRotation?(this: CelestialBody, angle: number): number;
	beforeMove?(this: CelestialBody, deltaT: number): void;
	afterMove?(this: CelestialBody, deltaT: number): void;
}

export interface BodyDefinition extends BodyHooks {
	name?: string;
	title?: string;
	/** kg */
	mass: number;
	/** km */
	radius: number;
	color?: string;
	traceColor?: string;
	/** texture url */
	map?: string;
	/** extra material properties, merged in the body's MeshPhongMaterial */
	material?: { emissive?: Color; specular?: Color };
	/** custom 3d representation, instead of a textured sphere */
	displayType?: 'sun';
	/** gaussian gravitational constant */
	k?: number;
	/** seconds */
	siderealDay?: number;
	baseMapRotation?: number;
	/** degrees */
	tilt?: number;
	ring?: RingDefinition;
	fov?: number;

	orbit?: OrbitDefinition;
	relativeTo?: string;
	traceRelativeTo?: string;
	osculatingElementsCalculator?: OsculatingElementsCalculator;
	positionCalculator?: PositionCalculator;

	isCentral?: boolean;
	isStill?: boolean;
	calculateFromElements?: boolean;
	useCustomComputation?: boolean;
	maxPrecision?: boolean;
	forceMaxPrecision?: boolean;
	resetPosAtTick?: boolean;

	hasGeoposCam?: boolean;
	showSolidOrbit?: boolean;
	forceTrace?: boolean;

	/** scenario specific state */
	data?: Record<string, number | boolean | undefined>;
	vertexDist?: number;
	logForces?: boolean;
}

export interface SecondsPerTick {
	min: number;
	max: number;
	initial: number;
}

/** GUI settings, as found in the query string, page defaults or scenarios */
export interface GuiSettings {
	scenario?: string;
	date?: string | Date;
	lookFrom?: string;
	lookAt?: string;
	planetScale?: number | string;
	/** scenario-forced planet scale */
	scale?: number;
	deltaT?: number | string;
	geoloc?: string;
	showHelp?: string;
	cameraSettings?: CameraSettings;
}

export interface CameraSettings {
	x?: number | string;
	y?: number | string;
	z?: number | string;
	fov?: number | string;
	far?: number;
	disableControls?: boolean;
}

export interface ScenarioDefinition {
	name: string;
	title?: string;
	help?: string;
	commonBodies?: BodyDefinition[] | null;
	bodies?: Record<string, Partial<BodyDefinition>>;
	secondsPerTick: SecondsPerTick;
	calculationsPerTick?: number;
	usePhysics?: boolean;
	useBarycenter?: boolean;
	defaultGuiSettings?: GuiSettings;
	forcedGuiSettings?: GuiSettings;
	fov?: number;
	sceneSize?: { width: number; height: number };
	/** async data needed before the scenario can start */
	load?: () => Promise<void>;
}

/** a scenario after its common bodies have been merged in its bodies */
export interface Scenario extends ScenarioDefinition {
	title: string;
	help: string;
	bodies: Record<string, BodyDefinition>;
}
