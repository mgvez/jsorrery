
import { J2000, DAY } from '../core/constants';

const gregorianReform = new Date('1582-10-15T00:00:00.000Z');

const UNIX_EPOCH_JULIAN_DATE = 2440587.5;
const UNIX_EPOCH_JULIAN_DAY = 2440587;

export function getJD(date) {
	
	return (((+date) / 1000) / DAY) + UNIX_EPOCH_JULIAN_DATE;
}

export function getJ2000SecondsFromJD(jd) {
	// console.log(jd - J2000);
	return (Number(jd) - J2000) * DAY;
}

export function getDateFromJD(jd) {
	const date = new Date();
	const t = (jd - UNIX_EPOCH_JULIAN_DATE) * DAY * 1000;
	date.setTime(t);
	return date;
}

export const J2000Date = getDateFromJD(J2000);

export function getJ2000SecondsFromDate(userDate) {
	const reqDate = userDate || new Date();
	return ((reqDate - J2000Date) / 1000);
}

export function getDeltaT(date) {
	const y = Number(date.getUTCFullYear());
	let dt;
	if (y >= 2005 && y < 2050) {
		const u = y - 2000;
		dt = 62.92 + 0.32217 * u + 0.005589 * (u ** 2);
	} else if (y >= 1986 && y < 2005) {
		const u = y - 2000;
		dt = 63.86 + 0.3345 * u - 0.060374 * (u ** 2) + 0.0017275 * (u ** 3) + 0.000651814 * (u ** 4) + 0.00002373599 * (u ** 5);
	} else if (y >= 1961 && y < 1986) {
		const u = y - 1975;
		dt = 45.45 + 1.067 * u - (u ** 2) / 260 - (u ** 3) / 718;
	} else if (y >= 1941 && y < 1961) {
		const u = y - 1950;
		dt = 29.07 + 0.407 * u - (u ** 2) / 233 + (u ** 3) / 2547;
	} else if (y >= 1920 && y < 1941) {
		const u = y - 1920;
		dt = 21.20 + 0.84493 * u - 0.076100 * (u ** 2) + 0.0020936 * (u ** 3);
	} else if (y >= 1900 && y < 1920) {
		const u = y - 1900;
		dt = -2.79 + 1.494119 * u - 0.0598939 * (u ** 2) + 0.0061966 * (u ** 3) - 0.000197 * (u ** 4);
	} else if (y >= 2050 && y < 2150) {
		dt = -20 + 32 * (((y - 1820) / 100) ** 2) - 0.5628 * (2150 - y);
	} else if (y < -500 || y > 2150) {
		const u = (y - 1820) / 100;
		dt = -20 + 32 * (u ** 2);
	} else if (y >= 500 && y < 1600) {
		const u = (y - 1000) / 100;
		dt = 1574.2 - 556.01 * u + 71.23472 * (u ** 2) + 0.319781 * (u ** 3) - 0.8503463 * (u ** 4) - 0.005050998 * (u ** 5) + 0.0083572073 * (u ** 6);
	} else if (y >= 1600 && y < 1700) {
		const u = y - 1600;
		dt = 120 - 0.9808 * u - 0.01532 * (u ** 2) + (u ** 3) / 7129;
	} else if (y >= 1700 && y < 1800) {
		const u = y - 1700;
		dt = 8.83 + 0.1603 * u - 0.0059285 * (u ** 2) + 0.00013336 * (u ** 3) - (u ** 4) / 1174000;
	} else if (y >= 1800 && y < 1860) {
		const u = y - 1800;
		dt = 13.72 - 0.332447 * u + 0.0068612 * (u ** 2) + 0.0041116 * (u ** 3) - 0.00037436 * (u ** 4) + 0.0000121272 * (u ** 5) - 0.0000001699 * (u ** 6) + 0.000000000875 * (u ** 7);
	} else if (y >= 1860 && y < 1900) {
		const u = y - 1860;
		dt = 7.62 + 0.5737 * u - 0.251754 * (u ** 2) + 0.01680668 * (u ** 3) - 0.0004473624 * (u ** 4) + (u ** 5) / 233174;
	} else if (y >= -500 && y < 500) { 
		const u = y / 100;
		dt = 10583.6 - 1014.41 * u + 33.78311 * (u ** 2) - 5.952053 * (u ** 3) - 0.1798452 * (u ** 4) + 0.022174192 * (u ** 5) + 0.0090316521 * (u ** 6);
	}
	// console.log(dt);
	return dt;
}
