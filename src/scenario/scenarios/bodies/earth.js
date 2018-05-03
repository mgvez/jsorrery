
// import $ from 'jquery';
import { Color, Euler, Vector3 } from 'three';
import { J2000, AU, SIDEREAL_DAY, NM_TO_KM, CIRCLE, YEAR, DAY, DEG_TO_RAD } from '../../../core/constants';
import { J2000Date, getDeltaT } from '../../../utils/JD';
import { VSOP } from './earth/VSOP-earth';

//time from where rotation is computed: the solstice before system's reference time (J2000)
//solar noon at J2000 was 12:03:18, azimut at 12:00 was 179.15
//I have found that 1999-12-22T07:30:30.000Z aligns with the X axis, even if 1999-12-22T07:44:00.000Z is the solstice
//2000-03-20T07:26:28.000Z aligns with the Y axis, even though most sources cite 7:35 as the equinox
// see https://eclipse.gsfc.nasa.gov/SEpath/deltat.html for DeltaT
const solstice = new Date('1999-12-22T07:44:30.000Z');
//1 = 1 rotation
const baseRotation = (((J2000Date - solstice) / 1000) / (YEAR * SIDEREAL_DAY));
// let testTilt = 0;

export const earth = {
	title: 'The Earth',
	name: 'earth',
	mass: 5.9736e24,
	radius: 3443.9307 * NM_TO_KM,
	color: '#1F7CDA',
	//voir https://visibleearth.nasa.gov/view_cat.php?categoryID=1484 pour changer
	map: './assets/img/earthmap1k_clouds.jpg',
	material: {
		specular: new Color('grey'),
	},
	siderealDay: SIDEREAL_DAY,
	
	getRotationCorrection() {
		const dt = getDeltaT(this.universe.getCurrentDate());
		const r = baseRotation - (dt / DAY);
		// console.log('rot corr %s', r);
		return r;
	},
	baseMapRotation: 3 * CIRCLE / 4,
	tilt: 23 + (26 / 60) + (21 / 3600),
	positionCalculator: VSOP,
	hasGeoposCam: true,
	
	//tilt is oriented by taking into account precession of equinoxes
	getTilt(xCorrection = 0) {
		const nYears = ((this.currentJD || 0) - J2000) / YEAR;
		// console.log(xCorrection, nYears);
		const precession = (nYears / 25800) * CIRCLE;
		return new Euler(xCorrection - this.tilt * DEG_TO_RAD, 0, -precession, 'ZYX');
	},

	orbit: {
		base: {
			a: 1.00000261 * AU,
			e: 0.01671123,
			i: -0.00001531,
			l: 100.46457166,
			lp: 102.93768193,
			o: 0.0,
		},
		cy: {
			a: 0.00000562 * AU,
			e: -0.00004392,
			i: -0.01294668,
			l: 35999.37244981,
			lp: 0.32327364,
			o: 0.0,
		},
	},
};


// $(window).on('keyup.dbg', (e) => {
// 	const k = e.keyCode;
// 	if (k === 78) {
// 		testTilt += 0.01 * CIRCLE;
// 	} else if (k === 77) {
// 		testTilt -= 0.01 * CIRCLE;
// 	}
// 	getUniverse().requestDraw();
// });
