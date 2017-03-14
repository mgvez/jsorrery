/**
	Controls the display/hiding of orbit lines depending on the camera that is active
*/

import BodyOrbitLines from 'graphics3d/lines/BodyOrbitLines';

export default {
	init(rootContainer) {
		this.orbits = [];
	},

	/**
	Reset the default behavior of every orbit's orbit line (show the orbit, not the ecliptic)
	*/
	hideAllOrbits() {
		this.orbits.forEach(orbit => {
			orbit.hideOrbit();
		});
	},
	
	showAllOrbits() {
		this.orbits.forEach(orbit => {
			orbit.showOrbit();
		});
	},
	
	hideAllEcliptics() {
		this.orbits.forEach(orbit => {
			orbit.hideEcliptic();
		});
	},

	findOrbitIndex(name) {
		return this.orbits.findIndex(testOrbit => testOrbit.getName() === name);
	},

	getOrbitFromName(name) {
		const idx = this.findOrbitIndex(name);
		return ~idx ? this.orbits[idx] : null;
	},

	addBody(body3d) {
		const orbit = Object.create(BodyOrbitLines);
		orbit.init(body3d);
		body3d.setOrbitLines(orbit);
		const idx = this.findOrbitIndex(body3d.getName());
		if (!~idx) {
			this.orbits.push(orbit);
		} else {
			this.orbits[idx] = orbit;
		}
	},
	
	onCameraChange(lookFromBody, lookAtBody) {

		const lookFromBodyOrbit = lookFromBody && this.getOrbitFromName(lookFromBody.getName());
		const lookAtBodyOrbit = lookAtBody && this.getOrbitFromName(lookAtBody.getName());

		if (lookFromBodyOrbit) {
			this.hideAllOrbits();
			this.hideAllEcliptics();
			
			lookFromBodyOrbit.showEcliptic();

			if (lookAtBodyOrbit && lookAtBody.celestial.isOrbitAround(lookFromBody.celestial)) {
				lookAtBodyOrbit.showOrbit();
			}/**/

		} else {
			this.resetAllOrbits();
			this.showAllOrbits();
			this.hideAllEcliptics();
		}
	},

	resetAllOrbits() {
		this.orbits.forEach(orbit => {
			orbit.recalculateOrbitLine(true);
		});
	},

	kill() {
		this.orbits.forEach(orbit => {
			orbit.kill();
		});
	},
};
