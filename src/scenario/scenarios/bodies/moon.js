import { TweenMax, Sine } from 'gsap';
import { DAY } from 'constants';
import MoonRealOrbit from './moon/OsculatingOrbit';
import { ELP82B } from './moon/elp';

export const moon = {
	title: 'The Moon',
	name: 'moon',
	mass: 7.3477e22,
	radius: 1738.1,
	color: '#aaaaaa',
	map: './img/moonmap4k_levels.jpg',
	sideralDay: (27.3215782 * DAY),
	tilt: 1.5424,
	fov: 1,
	relativeTo: 'earth',
	osculatingElementsCalculator: MoonRealOrbit,
	positionCalculator: ELP82B,
	useCustomComputation: true,
	orbit: {
		base: {
			a: 384400,
			e: 0.0554,
			w: 318.15,
			M: 135.27,
			i: 5.16,
			o: 125.08,
		},
		day: {
			a: 0,
			e: 0,
			i: 0,
			M: 13.176358,
			w: (360 / 5.997) / 365.25,
			o: (360 / 18.600) / 365.25,
		},
	},
	getMapRotation(angle) {
		const circled = angle % Math.PI;
		if (circled > 0) {
			return circled;
		}
		return Math.PI + circled;
	},
	customInitialize() {
		if (this.relativeTo !== 'earth') return;
		this.baseMapRotation = this.getMapRotation(this.getAngleTo('earth') - this.getCurrentRotation());
		this.nextCheck = this.sideralDay;
	},
	customAfterTick(time) {
		if (this.relativeTo !== 'earth') return;
		//when a sideral day has passed, make sure that the near side is still facing the earth. Since the moon's orbit is heavily disturbed, some imprecision occurs in its orbit, and its duration is not always the same, especially in an incomplete scenario (where there are no sun/planets). Therefore, a correction is brought to the base map rotation, tweened so that is is not jerky.
		if (time >= this.nextCheck) {
			this.nextCheck += this.sideralDay;
			const rot = this.getMapRotation(this.getAngleTo('earth') - this.getCurrentRotation());
			TweenMax.to(this, 2, {
				baseMapRotation: rot,
				ease: Sine.easeInOut,
			});
		}
	},
};
