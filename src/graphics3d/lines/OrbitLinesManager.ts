/**
	Controls the display/hiding of orbit lines depending on the camera that is active
*/

import BodyOrbitLines from './BodyOrbitLines';
import type Body3D from '../Body3d';

export default class OrbitLinesManager {
	isForceSolidLines: boolean;
	orbits: BodyOrbitLines[] = [];

	/**
	 When paths are computed through physics, orbits are always shown as solid lines, because we cannot recompute them from positions
	 */
	constructor(isForceSolidLines: boolean) {
		this.isForceSolidLines = isForceSolidLines;
	}

	hideAllOrbits() {
		this.orbits.forEach(orbit => orbit.hideOrbit());
	}

	showAllOrbits() {
		this.orbits.forEach(orbit => orbit.showOrbit());
	}

	hideAllEcliptics() {
		this.orbits.forEach(orbit => orbit.hideEcliptic());
	}

	findOrbitIndex(name: string) {
		return this.orbits.findIndex(testOrbit => testOrbit.getName() === name);
	}

	getOrbitFromName(name: string) {
		const idx = this.findOrbitIndex(name);
		return idx !== -1 ? this.orbits[idx] : null;
	}

	addBody(body3d: Body3D) {
		const orbit = new BodyOrbitLines(body3d, this.isForceSolidLines);
		body3d.setOrbitLines(orbit);
		const idx = this.findOrbitIndex(body3d.getName());
		if (idx === -1) {
			this.orbits.push(orbit);
		} else {
			this.orbits[idx] = orbit;
		}
	}

	onCameraChange(lookFromBody?: Body3D, lookAtBody?: Body3D) {
		const lookFromBodyOrbit = lookFromBody && this.getOrbitFromName(lookFromBody.getName());
		const lookAtBodyOrbit = lookAtBody && this.getOrbitFromName(lookAtBody.getName());

		if (lookFromBodyOrbit) {
			this.hideAllOrbits();
			this.hideAllEcliptics();

			lookFromBodyOrbit.showEcliptic();

			if (lookAtBodyOrbit && lookAtBody.celestial.isOrbitAround(lookFromBody.celestial) && !lookAtBody.celestial.maxPrecision) {
				lookAtBodyOrbit.showOrbit();
			}
		} else {
			this.resetAllOrbits();
			this.showAllOrbits();
			this.hideAllEcliptics();
		}
	}

	resetAllOrbits() {
		this.orbits.forEach(orbit => orbit.recalculateOrbitLine(true));
	}

	kill() {
		this.orbits.forEach(orbit => orbit.kill());
	}
}
