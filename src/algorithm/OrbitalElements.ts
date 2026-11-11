import { Vector3, Euler, Quaternion } from 'three';

import { sinh, sign, cosh } from './Math';
import { getJ2000SecondsFromJD } from '../utils/JD';
import { G, CENTURY, DAY, KM, DEG_TO_RAD, CIRCLE, AU } from '../core/constants';
import type {
	ComputedElements,
	OrbitDefinition,
	OrbitalElementsSet,
	OsculatingElementsCalculator,
	PositionCalculator,
} from '../scenario/types';
import type CelestialBody from '../core/CelestialBody';

type KeplerFunction = (x: number) => number;

function solveEccentricAnomaly(f: KeplerFunction, x0: number, maxIter: number) {
	let x = 0;
	let x2 = x0;

	for (let i = 0; i < maxIter; i++) {
		x = x2;
		x2 = f(x);
	}

	return x2;
}

function solveKepler(e: number, M: number): KeplerFunction {
	return (x) => {
		return x + (M + e * Math.sin(x) - x) / (1 - e * Math.cos(x));
	};
}

function solveKeplerLaguerreConway(e: number, M: number): KeplerFunction {
	return (x) => {
		const s = e * Math.sin(x);
		const c = e * Math.cos(x);
		const f = x - s - M;
		const f1 = 1 - c;
		const f2 = s;

		return x + (-5 * f / (f1 + sign(f1) * Math.sqrt(Math.abs(16 * f1 * f1 - 20 * f * f2))));
	};
}

function solveKeplerLaguerreConwayHyp(e: number, M: number): KeplerFunction {
	return (x) => {
		const s = e * sinh(x);
		const c = e * cosh(x);
		const f = x - s - M;
		const f1 = c - 1;
		const f2 = s;

		return x + (-5 * f / (f1 + sign(f1) * Math.sqrt(Math.abs(16 * f1 * f1 - 20 * f * f2))));
	};
}

/**
 Computes a body's position and velocity from its orbital elements (or from a precise position calculator, e.g. VSOP87).

	Epoch : J2000

	a 	Semi-major axis
	e 	Eccentricity
	i 	Inclination
	o 	Longitude of Ascending Node (Ω)
	w 	Argument of periapsis (ω)
	E 	Eccentric Anomaly
	T 	Time at perihelion
	M	Mean anomaly
	l 	Mean Longitude
	lp	longitude of periapsis
	r	distance du centre
	v	true anomaly

	P	Sidereal period (mean value)
	Pw	Argument of periapsis precession period (mean value)
	Pn	Longitude of the ascending node precession period (mean value)
 */
export default class OrbitalElements {
	name?: string;
	orbitalElements?: OrbitDefinition;
	epochOffsetFromJ2000?: number;
	calculator?: OsculatingElementsCalculator;
	positionCalculator?: PositionCalculator;
	relativeTo?: CelestialBody;

	setDefaultOrbit(orbitalElements?: OrbitDefinition, calculator?: OsculatingElementsCalculator, positionCalculator?: PositionCalculator) {
		this.orbitalElements = orbitalElements;
		if (orbitalElements && orbitalElements.epoch) {
			this.epochOffsetFromJ2000 = getJ2000SecondsFromJD(orbitalElements.epoch);
		}
		this.calculator = calculator;
		this.positionCalculator = positionCalculator;
	}

	setName(name: string) {
		this.name = name;
	}

	setRelativeTo(body: CelestialBody | undefined) {
		this.relativeTo = body;
	}

	calculateVelocity(jd: number) {
		if (!this.orbitalElements) return new Vector3(0, 0, 0);

		let eclipticVelocity: Vector3;

		if (!this.relativeTo) {
			const pos1 = this.calculatePosition(jd);
			const pos2 = this.calculatePosition(jd + 60 / DAY);
			eclipticVelocity = pos2.sub(pos1).multiplyScalar(1 / 60);
		} else {
			//vis viva to calculate speed (not velocity, i.e not a vector)
			const el = this.calculateElements(jd)!;
			const r = el.r!;
			const speed = Math.sqrt(G * this.relativeTo.mass * ((2 / r) - (1 / el.a)));

			//now calculate velocity orientation, that is, a vector tangent to the orbital ellipse
			const k = r / el.a;
			let o = ((2 - (2 * el.e * el.e)) / (k * (2 - k))) - 1;
			//floating point imprecision
			o = o > 1 ? 1 : o;
			let alpha = Math.PI - Math.acos(o);
			alpha = el.v! < 0 ? (2 * Math.PI) - alpha : alpha;
			const velocityAngle = el.v! + (alpha / 2);
			//velocity vector in the plane of the orbit
			const orbitalVelocity = new Vector3(Math.cos(velocityAngle), Math.sin(velocityAngle)).setLength(speed);
			const velocityEls: ComputedElements = { ...el, pos: orbitalVelocity, v: null, r: null };
			eclipticVelocity = this.getPositionFromElements(velocityEls);
		}

		return eclipticVelocity;
	}

	/**
	 Position (m) at a given julian date. Uses the precise position calculator if the body has one, unless maxPrecision is false.
	 */
	calculatePosition(jd: number, maxPrecision: boolean | undefined = true, isDbg = false) {
		if (!this.orbitalElements) return new Vector3(0, 0, 0);
		//position calculators are very slow, we use them only when requested
		if (this.positionCalculator && maxPrecision) {
			return this.positionCalculator(jd);
		}
		const computed = this.calculateElements(jd, isDbg);
		const pos = this.getPositionFromElements(computed);
		if (isDbg) console.log(this.name, pos.x, pos.y, pos.z, jd);
		return pos;
	}

	solveEccentricAnomaly(e: number, M: number) {
		if (e === 0.0) {
			return M;
		} else if (e < 0.9) {
			return solveEccentricAnomaly(solveKepler(e, M), M, 6);
		} else if (e < 1.0) {
			const E = M + 0.85 * e * ((Math.sin(M) >= 0.0) ? 1 : -1);
			return solveEccentricAnomaly(solveKeplerLaguerreConway(e, M), E, 8);
		} else if (e === 1.0) {
			return M;
		}

		const E = Math.log(2 * M / e + 1.85);
		return solveEccentricAnomaly(solveKeplerLaguerreConwayHyp(e, M), E, 30);
	}

	calculateElements(jd: number, isDbg?: boolean): ComputedElements | null {
		if (!this.orbitalElements) return null;

		const orbitalElements = this.orbitalElements;

		 
		if (isDbg) console.log('========================');
		let correctedTimeEpoch = getJ2000SecondsFromJD(jd);
		if (isDbg) console.log(correctedTimeEpoch, this.epochOffsetFromJ2000);
		if (this.epochOffsetFromJ2000) {
			correctedTimeEpoch -= this.epochOffsetFromJ2000;
		}

		const tDays = correctedTimeEpoch / DAY;
		const T = tDays / CENTURY;
		if (isDbg) console.log('jd %s, tDays %s, T %s', jd, tDays, T);
		if (isDbg) console.log('jd epoch %s', orbitalElements.epoch);

		// the elements are built up incrementally below; their final shape is ComputedElements
		let computed: Record<string, number> & { pos?: Vector3 } = {
			t: correctedTimeEpoch,
		};

		if (this.calculator) {
			const realorbit = this.calculator(T);
			Object.assign(computed, realorbit);
		} else {
			if (orbitalElements.base) {
				const base = orbitalElements.base;
				let variation: number | undefined;
				const keys = orbitalElements.keys = orbitalElements.keys || (Object.keys(base) as (keyof OrbitalElementsSet)[]);
				computed = keys.reduce((carry, el) => {
					//cy : variation by century.
					//day : variation by day.
					variation = orbitalElements.cy ? orbitalElements.cy[el] : (orbitalElements.day![el]! * CENTURY);
					variation = variation || 0;
					carry[el] = base[el]! + (variation * T);
					return carry;
				}, computed);
			} else {
				computed = Object.assign({}, orbitalElements) as Record<string, number>;
			}

			if (undefined === computed.w) {
				computed.w = computed.lp - computed.o;
			}

			if (undefined === computed.M) {
				computed.M = computed.l - computed.lp;
			}

			computed.a *= KM;//was in km, set it in m
		}

		if (isDbg) console.log('M %s, e %s, i %s, o %s, w %s', computed.M, computed.e, computed.i, computed.o, computed.w);
		computed.i *= DEG_TO_RAD;
		computed.o *= DEG_TO_RAD;
		computed.w *= DEG_TO_RAD;
		computed.M *= DEG_TO_RAD;

		computed.E = this.solveEccentricAnomaly(computed.e, computed.M);

		computed.E %= CIRCLE;
		computed.i %= CIRCLE;
		computed.o %= CIRCLE;
		computed.w %= CIRCLE;
		computed.M %= CIRCLE;

		//in the plane of the orbit
		const pos = new Vector3(computed.a * (Math.cos(computed.E) - computed.e), computed.a * (Math.sqrt(1 - (computed.e * computed.e))) * Math.sin(computed.E));
		computed.pos = pos;
		if (isDbg) console.log('E %s, e %s, M %s, i %s', computed.E, computed.e, computed.M, computed.i);
		if (isDbg) console.log('x %s, y %s, z %s, a %s', pos.x, pos.y, pos.z, computed.a);
		 

		const result = computed as unknown as ComputedElements;
		result.isDbg = isDbg;
		result.r = pos.length();
		result.v = Math.atan2(pos.y, pos.x);
		//if orbital elements are computed relative to a body, we need to tilt the orbit according to this body's tilt (for example satellites around the earth) Some though are positionned relative to another, but oriented relative to the universe
		if (orbitalElements.tilt !== false && this.relativeTo && this.relativeTo.tilt) {
			result.tilt = -this.relativeTo.tilt * DEG_TO_RAD;
		}
		return result;
	}

	getPositionFromElements(computed: ComputedElements | null) {
		if (!computed) return new Vector3(0, 0, 0);

		const a1 = new Euler(computed.tilt || 0, 0, computed.o, 'XYZ');
		const q1 = new Quaternion().setFromEuler(a1);
		const a2 = new Euler(computed.i, 0, computed.w, 'XYZ');
		const q2 = new Quaternion().setFromEuler(a2);

		const planeQuat = new Quaternion().multiplyQuaternions(q1, q2);
		computed.pos.applyQuaternion(planeQuat);

		return computed.pos;
	}

	calculatePeriod(elements: ComputedElements | null) {
		let period = 0;
		const orbitalElements = this.orbitalElements;
		if (orbitalElements && orbitalElements.cy) {
			period = 360 / ((orbitalElements.cy.l! - orbitalElements.cy.lp!) / CENTURY);
		} else if (orbitalElements && orbitalElements.day && orbitalElements.day.M) {
			period = 360 / orbitalElements.day.M;
		} else if (this.relativeTo && this.relativeTo.k && elements) {
			period = 2 * Math.PI * Math.sqrt(((elements.a / (AU * 1000)) ** 3)) / this.relativeTo.k;
		} else {
			period = NaN;
		}
		period *= DAY;//in seconds
		return period;
	}
}
