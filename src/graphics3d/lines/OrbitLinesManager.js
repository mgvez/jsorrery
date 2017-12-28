/**
	Controls the display/hiding of orbit lines depending on the camera that is active
*/

import BodyOrbitLines from './BodyOrbitLines';

export default class OrbitLinesManager {
	/**
	 When paths are computed through phisics, orbits are always shown as solid lines, because we cannot recompute them from positions
	 */
	constructor(isForceSolidLines) {
		this.isForceSolidLines = isForceSolidLines;
		this.orbits = [];
	}

	/**
	Reset the default behavior of every orbit's orbit line (show the orbit, not the ecliptic)
	*/
	hideAllOrbits() {
		this.orbits.forEach(orbit => {
			orbit.hideOrbit();
		});
	}
	
	showAllOrbits() {
		this.orbits.forEach(orbit => {
			orbit.showOrbit();
		});
	}
	
	hideAllEcliptics() {
		this.orbits.forEach(orbit => {
			orbit.hideEcliptic();
		});
	}

	findOrbitIndex(name) {
		return this.orbits.findIndex(testOrbit => testOrbit.getName() === name);
	}

	getOrbitFromName(name) {
		const idx = this.findOrbitIndex(name);
		return ~idx ? this.orbits[idx] : null;
	}

	addBody(body3d) {
		const orbit = new BodyOrbitLines(body3d, this.isForceSolidLines);
		body3d.setOrbitLines(orbit);
		const idx = this.findOrbitIndex(body3d.getName());
		if (!~idx) {
			this.orbits.push(orbit);
		} else {
			this.orbits[idx] = orbit;
		}
	}
	
	onCameraChange(lookFromBody, lookAtBody) {

		const lookFromBodyOrbit = lookFromBody && this.getOrbitFromName(lookFromBody.getName());
		const lookAtBodyOrbit = lookAtBody && this.getOrbitFromName(lookAtBody.getName());

		if (lookFromBodyOrbit) {
			this.hideAllOrbits();
			this.hideAllEcliptics();
			
			lookFromBodyOrbit.showEcliptic();

			if (lookAtBodyOrbit && lookAtBody.celestial.isOrbitAround(lookFromBody.celestial) && !lookAtBody.celestial.maxPrecision) {
				lookAtBodyOrbit.showOrbit();
			}/**/

		} else {
			this.resetAllOrbits();
			this.showAllOrbits();
			this.hideAllEcliptics();
		}
	}

	resetAllOrbits() {
		this.orbits.forEach(orbit => {
			orbit.recalculateOrbitLine(true);
		});
	}

	kill() {
		this.orbits.forEach(orbit => {
			orbit.kill();
		});
	}
};
