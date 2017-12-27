/**
	source for calculations http://www.braeunig.us/apollo/apollo11-TLI.htm
*/
import { DEG_TO_RAD, RAD_TO_DEG, FT_TO_M, KM, CIRCLE, DAY } from '../../core/constants';
import { earth } from './bodies/earth';
import { getJD } from '../../utils/JD';


//source: http://www.csgnetwork.com/siderealjuliantimecalc.html
function getLongAtLocalSiderealTime(dateGMT, longitude) {
	const day = dateGMT.getUTCDate();
	let month = dateGMT.getUTCMonth() + 1;
	let year = dateGMT.getUTCFullYear();
	const hour = dateGMT.getUTCHours();
	const minute = dateGMT.getUTCMinutes();
	const second = dateGMT.getUTCSeconds();

	//		Julian Day 
	if (month < 3) {
		year -= 1;
		month += 12;
	}

	let GR = 0;
	if (year + month / 100 + day / 10000 >= 1582.1015) {
		GR = 2 - Math.floor(year / 100) + Math.floor(Math.floor(year / 100) / 4);
	}

	const JD = Math.floor(365.25 * year) + Math.floor(30.6001 * (month + 1)) + day + 1720994.5 + GR;

//		time sidereal 0h
	const T = (JD - 2415020) / 36525;
	const SS = 6.6460656 + 2400.051 * T + 0.00002581 * T * T;
	const ST = (SS / 24 - Math.floor(SS / 24)) * 24;

//		time sidereal local
	const dayTime = (hour + (minute / 60) + (second / 3600)) / 24;
	let SA = ST + dayTime * 24 * 1.002737908;
	SA += longitude / 15;
	SA = (SA + 24) % 24;

	const TSH = Math.floor(SA);
	const TSM = Math.floor((SA - Math.floor(SA)) * 60);
	const TSS = ((SA - Math.floor(SA)) * 60 - TSM) * 60;
	
	return ((TSH / 24) + (TSM / (24 * 60)) + (TSS / (24 * 60 * 60))) * 360;
}


const GM = 3.986005e14;
function getMissionNumbers(orbitType = 'earth') {

	//see http://www.braeunig.us/apollo/apollo11-TLI.htm

	const numbers = this.orbits[orbitType];
	if (!numbers) return null;

	const v = numbers.spaceVel * FT_TO_M;
	const r = (numbers.altitude * FT_TO_M) + (earth.radius * KM);
	const C = (2 * GM) / (r * (v ** 2));

	const pathAngle = DEG_TO_RAD * numbers.pathAngle;
	const cosPathSq = Math.cos(pathAngle) ** 2;
	const sinPathSq = Math.sin(pathAngle) ** 2;
	const CSquared = C ** 2;
	const arg1 = Math.sqrt(CSquared - 4 * (1 - C) * -cosPathSq);
	const arg2 = (2 * (1 - C));
	//radius perigee
	// const rp = ((-C + arg1) / arg2) * r;
	//radius apogee
	const ra = ((-C - arg1) / arg2) * r;
	//eccentricity
	const e = Math.sqrt(((((r * (v ** 2)) / GM) - 1) ** 2) * cosPathSq + sinPathSq);
	//semimajor axis
	const a = (r + ra) / 2;

	const rvgm = r * (v ** 2) / GM;
	//true anomaly
	const trueAnomaly = Math.atan((rvgm * Math.cos(pathAngle) * Math.sin(pathAngle)) / (rvgm * cosPathSq - 1));/**/
	
	const ln = Math.asin(Math.sin(DEG_TO_RAD * numbers.geoLat) / Math.sin(DEG_TO_RAD * numbers.incl));
	const as = Math.atan(Math.tan(ln) * Math.cos(DEG_TO_RAD * numbers.incl));

	const argumentPerigee = ln - trueAnomaly;

	const geoLongAscNode = ((DEG_TO_RAD * numbers.long) - as) + CIRCLE;


	let epoch;
	if (numbers.gmt) {
		epoch = new Date(numbers.gmt);
	} else {
		epoch = new Date(new Date(this.launchTime).getTime() + numbers.time * 1000);
	}
	const celestLongAscNode = getLongAtLocalSiderealTime(epoch, geoLongAscNode * RAD_TO_DEG);

	const E = Math.acos((e + Math.cos(trueAnomaly)) / (1 + e * Math.cos(trueAnomaly)));
	const M = E - e * Math.sin(E);
	const N = Math.sqrt(GM / (a ** 3));
	// const T = M / N;
	
	/*
	console.log('**************************************** '+orbitType);
	console.log('r',r);
	console.log('v',v);
	console.log('C',C);
	console.log('perigee',rp);
	console.log('apogee',ra);
	console.log('eccentricity',e);
	console.log('trueAnomaly', trueAnomaly * ns.RAD_TO_DEG);
	console.log('argumentPerigee', argumentPerigee * ns.RAD_TO_DEG);
	console.log('semi-major axis',a);
	console.log('ln',ln * ns.RAD_TO_DEG);
	console.log('as',as * ns.RAD_TO_DEG);
	console.log('geoLongAscNode', geoLongAscNode * ns.RAD_TO_DEG);
	console.log('celestLongAscNode', celestLongAscNode);
	console.log('E', E);
	console.log('M', M);
	console.log('N', N);
	console.log('T', T);
	/**/

	/*if(orbitType=='earth'){
		celestLongAscNode += 145;
		celestLongAscNode = celestLongAscNode%360;
	}/**/
	// console.log(epoch, a / KM);
	return {
		relativeTo: 'earth',
		orbit: {
			epoch: getJD(epoch),
			base: {
				a: a / KM,
				e,
				w: (argumentPerigee * RAD_TO_DEG), 
				M: M * RAD_TO_DEG,
				i: numbers.incl,
				o: celestLongAscNode,
			},
			day: {
				a: 0,
				e: 0,
				i: 0,
				M: N * RAD_TO_DEG * DAY,
				w: 0,
				o: 0,
			},
		},
	};
}

const missions = [];

export function getMissionFromName(missionName) {

	return missions.find(mission => mission.name === missionName);

}

export const Apollo7 = {
	name: 'Apollo7',
	launchTime: '1968-10-11:15:02:45.000Z',
	orbits: {
		earth: {
			time: 626.76, //Insertion - GET (sec)
			altitude: 748439, //Altitude (ft)
			surfRange: 1121.743, //Surface Range (n mi)
			earthVel: 24208.5, //Earth Fixed Velocity (ft/sec)
			spaceVel: 25553.2, //Space-Fixed Velocity (ft/sec)
			geoLat: 31.4091, //Geocentric Latitude (deg N)
			geodLat: 31.58, //Geodetic Latitude (deg N)
			long: -61.2293, //Longitude (deg E)
			pathAngle: 0.005, //Space-Fixed Flight Path Angle (deg)
			headingAngle: 86.32, //Space-Fixed Heading Angle (deg E of N)
			apo: 152.34, //Apogee (n mi)
			peri: 123.03, //Perigee (n mi)
			period: 89.55, //Period (mins)
			incl: 31.608, //Inclination (deg)
			descNode: 42.415, //Descending Node (deg) 
			ecc: 0.0045, //Eccentricity
		},
	},
};
missions.push(Apollo7);

export const Apollo8 = {
	name: 'Apollo8',
	launchTime: '1968-12-21T12:51:00.000Z',
	orbits: {
		earth: {
			time: 694.98,
			altitude: 627819,
			surfRange: 1430.363,
			earthVel: 24242.9,
			spaceVel: 25567.06,
			geoLat: 32.4741,
			geodLat: 32.6487,
			long: -53.2923,
			pathAngle: 0.0006,
			headingAngle: 88.532,
			apo: 99.99,
			peri: 99.57,
			period: 88.19,
			incl: 32.509,
			descNode: 45.538,
			ecc: 0.00006,
		},
		TLI: {
			time: '002:56:05.51',
			gmt: '1968-12-21T15:47:05.000Z',
			altitude: 1137577,
			earthVel: 34140.1,
			spaceVel: 35505.41,
			geoLat: 21.346,
			geodLat: 21.477,
			long: -143.9242,
			pathAngle: 7.897,
			headingAngle: 67.494,
			incl: 30.636,
			descNode: 38.983,
			ecc: 0.97553,
			c3: -15918930,
		},
	},
};
missions.push(Apollo8);

export const Apollo9 = {
	name: 'Apollo9',
	launchTime: '1969-03-03:16:00:00.000Z',
	orbits: {
		earth: {
			time: 674.66,
			altitude: 626777,
			surfRange: 1335.515,
			earthVel: 24246.39,
			spaceVel: 25569.78,
			geoLat: 32.4599,
			geodLat: 32.629,
			long: -55.1658,
			pathAngle: -0.0058,
			headingAngle: 87.412,
			apo: 100.74,
			peri: 99.68,
			period: 88.2,
			incl: 32.552,
			descNode: 123.132,
			ecc: 0.000149,
		},
	},
};
missions.push(Apollo9);

export const Apollo10 = {
	name: 'Apollo10',
	launchTime: '1969-05-18T16:49:00.000Z',
	orbits: {
		earth: {
			time: 713.76,
			altitude: 627869,
			surfRange: 1469.79,
			earthVel: 24244.3,
			spaceVel: 25567.88,
			geoLat: 32.5303,
			geodLat: 32.7,
			long: -52.526,
			pathAngle: -0.0049,
			headingAngle: 89.933,
			apo: 100.32,
			peri: 99.71,
			period: 88.2,
			incl: 32.546,
			descNode: 123.088,
			ecc: 0.000086,
		},
		TLI: {
			time: '002:39:20.58',
			gmt: '1969-05-18T19:28:20.000Z',
			altitude: 1093217,
			earthVel: 34217.2,
			spaceVel: 35562.96,
			geoLat: -13.5435,
			geodLat: -13.627,
			long: 159.9201,
			pathAngle: 7.379,
			headingAngle: 61.065,
			incl: 31.698,
			descNode: 123.515,
			ecc: 0.97834,
			c3: -14084265,
		},
	},
};
missions.push(Apollo10);

export const Apollo11 = {
	name: 'Apollo11',
	launchTime: '1969-07-16T13:32:00.000Z',
	orbits: {
		earth: {
			time: 709.33,
			altitude: 626909,
			surfRange: 1460.697,
			earthVel: 24243.9,
			spaceVel: 25567.9,
			geoLat: 32.5027,
			geodLat: 32.672,
			long: -52.6941,
			pathAngle: 0.012,
			headingAngle: 88.848,
			apo: 100.4,
			peri: 98.9,
			period: 88.18,
			incl: 32.521,
			descNode: 123.126,
			ecc: 0.00021,
		},
		TLI: {
			time: '002:50:13.03',
			gmt: '1969-07-16T16:22:13.000Z',
			altitude: 1097229,
			earthVel: 34195.6,
			spaceVel: 35545.6,
			geoLat: 9.9204,
			geodLat: 9.983,
			long: -164.8373,
			pathAngle: 7.367,
			headingAngle: 60.073,
			incl: 31.383,
			descNode: 121.847,
			ecc: 0.97696,
			c3: -14979133,
		},
	},
};
missions.push(Apollo11);

export const Apollo12 = {
	name: 'Apollo12',
	launchTime: '1969-11-14T16:22:00.000Z',
	orbits: {
		earth: {
			time: 703.91,
			altitude: 626360,
			surfRange: 1438.608,
			earthVel: 24242.3,
			spaceVel: 25565.9,
			geoLat: 31.5128,
			geodLat: 32.6823,
			long: -53.1311,
			pathAngle: -0.014,
			headingAngle: 88.58,
			apo: 100.1,
			peri: 97.8,
			period: 88.16,
			incl: 32.54,
			descNode: 123.084,
			ecc: 0.00032,
		},
		TLI: {
			time: '002:53:13.94',
			gmt: '1969-11-14T19:15:13.000Z',
			altitude: 1209284,
			earthVel: 34020.5,
			spaceVel: 35389.8,
			geoLat: 16.0791,
			geodLat: 16.176,
			long: -154.2798,
			pathAngle: 8.584,
			headingAngle: 63.902,
			incl: 30.555,
			descNode: 120.388,
			ecc: 0.96966,
			c3: -19745586,
		},
	},
};
missions.push(Apollo12);

export const Apollo13 = {
	name: 'Apollo13',
	launchTime: '1970-04-11T19:13:00.000Z',
	orbits: {
		earth: {
			time: 759.83,
			altitude: 628710,
			surfRange: 1572.3,
			earthVel: 24242.1,
			spaceVel: 25566.1,
			geoLat: 32.5249,
			geodLat: 32.6945,
			long: -50.4902,
			pathAngle: 0.005,
			headingAngle: 90.148,
			apo: 100.3,
			peri: 99.3,
			period: 88.19,
			incl: 32.547,
			descNode: 117.455,
			ecc: 0.0001,
		},
		TLI: {
			time: '002:41:47.15',
			gmt: '1970-04-11T21:54:47.000Z',
			altitude: 1108555,
			earthVel: 34195.3,
			spaceVel: 35538.4,
			geoLat: -3.8635,
			geodLat: -3.8602,
			long: 167.2074,
			pathAngle: 7.635,
			headingAngle: 59.318,
			incl: 31.817,
			descNode: 122.997,
			ecc: 0.9772,
			c3: -14814090,
		},
	},
};
missions.push(Apollo13);

export const Apollo14 = {
	name: 'Apollo14',
	launchTime: '1971-01-31T21:03:02.000Z',
	orbits: {
		earth: {
			time: 710.56,
			altitude: 626364,
			surfRange: 1444.989,
			earthVel: 24221.6,
			spaceVel: 25565.8,
			geoLat: 31.0806,
			geodLat: 31.246,
			long: -52.9826,
			pathAngle: -0.003,
			headingAngle: 91.656,
			apo: 100.1,
			peri: 98.9,
			period: 88.18,
			incl: 31.12,
			descNode: 109.314,
			ecc: 0.0002,
		},
		TLI: {
			time: '002:34:33.24',
			gmt: '1971-01-31T23:37:35.000Z',
			altitude: 1090930,
			earthVel: 34151.5,
			spaceVel: 35511.6,
			geoLat: -19.4388,
			geodLat: -19.554,
			long: 141.7312,
			pathAngle: 7.48,
			headingAngle: 65.583,
			incl: 30.834,
			descNode: 117.394,
			ecc: 0.9722,
			c3: -18096135,
		},
	},
};
missions.push(Apollo14);

export const Apollo15 = {
	name: 'Apollo15',
	launchTime: '1971-07-26T13:34:00.000Z',
	orbits: {
		earth: {
			time: 704.67,
			altitude: 566387,
			surfRange: 1445.652,
			earthVel: 24242.4,
			spaceVel: 25602.6,
			geoLat: 29.2052,
			geodLat: 29.365,
			long: -53.0807,
			pathAngle: 0.015,
			headingAngle: 95.531,
			apo: 91.5,
			peri: 89.6,
			period: 87.84,
			incl: 29.679,
			descNode: 123.123,
			ecc: 0.0003,
		},
		TLI: {
			time: '002:56:03.61',
			gmt: '1971-07-26T16:30:03.000Z',
			altitude: 1055296,
			earthVel: 34202.2,
			spaceVel: 35579.1,
			geoLat: 24.8341,
			geodLat: 24.97,
			long: -142.1295,
			pathAngle: 7.43,
			headingAngle: 73.173,
			incl: 29.696,
			descNode: 108.439,
			ecc: 0.976,
			c3: -15643934,
		},
	},
};
missions.push(Apollo15);

export const Apollo16 = {
	name: 'Apollo16',
	launchTime: '1972-04-16T17:54:00.000Z',
	orbits: {
		earth: {
			time: 716.21,
			altitude: 567371,
			surfRange: 1469.052,
			earthVel: 24286.1,
			spaceVel: 25605,
			geoLat: 32.5262,
			geodLat: 32.6963,
			long: -52.53,
			pathAngle: 0.001,
			headingAngle: 88.932,
			apo: 91.3,
			peri: 90,
			period: 87.85,
			incl: 32.542,
			descNode: 86.978,
			ecc: 0.0002,
		},
		TLI: {
			time: '002:39:28.42',
			gmt: '1972-04-16T20:33:28.000Z',
			altitude: 1040493,
			earthVel: 34236.6,
			spaceVel: 35566.1,
			geoLat: -11.9117,
			geodLat: -11.9881,
			long: 162.482,
			pathAngle: 7.461,
			headingAngle: 59.524,
			incl: 32.511,
			descNode: 122.463,
			ecc: 0.9741,
			c3: -16881439,
		},
	},
};
missions.push(Apollo16);

export const Apollo17 = {
	name: 'Apollo17',
	launchTime: '1972-12-07T05:33:00.000Z',
	orbits: {
		earth: {
			time: 712.65,
			altitude: 559348,
			surfRange: 1456.314,
			earthVel: 24230.9,
			spaceVel: 25603.9,
			geoLat: 24.5384,
			geodLat: 24.6805,
			long: -53.8107,
			pathAngle: 0.003,
			headingAngle: 105.021,
			apo: 90.3,
			peri: 90,
			period: 87.83,
			incl: 28.526,
			ecc: 0,
		},
		TLI: {
			time: '003:18:37.64',
			gmt: '1972-12-07T08:51:37.000Z',
			altitude: 1029299,
			earthVel: 34168.3,
			spaceVel: 35555.3,
			geoLat: 4.6824,
			geodLat: 4.71,
			long: -53.119,
			pathAngle: 7.379,
			headingAngle: 118.11,
			incl: 28.466,
			descNode: 86.042,
			ecc: 0.9722,
			c3: -18152226,
		},
	},
};
missions.push(Apollo17);

export const Mercury6 = {
	name: 'Mercury6',
	launchTime: '',
	orbits: {
		earth: {
			time: 0,
			altitude: 528381,
			spaceVel: 25730,
			geoLat: 0,
			geodLat: 0,
			long: 0,
			pathAngle: -0.0468,
			headingAngle: 0,
			apo: 140.92,
			peri: 86.92,
			period: 88.48,
			incl: 32.54,
		},
	},
};
missions.push(Mercury6);

export const Mercury7 = {
	name: 'Mercury7',
	launchTime: '1962-05-25T12:45:00.000Z',
	orbits: {
		earth: {
			time: 312.2,
			altitude: 527894,
			spaceVel: 25738,
			geoLat: 30.37,
			geodLat: 30.5374,
			long: -72.2416,
			pathAngle: -0.0031,
			headingAngle: 77.6915,
			apo: 144.96,
			peri: 86.87,
			period: 88.53,
			incl: 32.55,
		},
	},
};
missions.push(Mercury7);

export const Mercury8 = {
	name: 'Mercury8',
	launchTime: '1962-10-03T12:15:11.000Z',
	orbits: {
		earth: {
			time: 319,
			altitude: 528510,
			spaceVel: 25751,
			geoLat: 30.42, //approx
			geodLat: 30.5885,
			long: -71.9946,
			pathAngle: -0.0085,
			headingAngle: 77.8228,
			apo: 152.8,
			peri: 86.94,
			period: 88.91,
			incl: 32.55,
		},
	},
};
missions.push(Mercury8);

missions.forEach(mission => {
	mission.getNumbers = getMissionNumbers;
});
