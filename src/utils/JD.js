
import { J2000, DAY } from 'constants';

const gregorianReform = new Date('1582-10-15T00:00:00.000Z');

export function getJD(date) {
	
	const M = date.getUTCMonth() + 1;
	const d = date.getUTCDate();
	const a = Math.floor((14 - M) / 12);
	const y = date.getUTCFullYear() + 4800 - a;
	const m = M + 12 * a - 3; 

	// 
	// console.log(JD2)
	console.log(date);
	console.log(M, d, date.getUTCFullYear());
	console.log(d, a, y, m);

	let jdn;
	//gregorian
	if (date >= gregorianReform) {
		jdn = d + Math.floor( (153 * m + 2) / 5) + (365 * y) + Math.floor(y / 4) - Math.floor( y / 100) + Math.floor(y / 400) - 32045;
	//julian
	} else {
		jdn = d + Math.floor((153 * m + 2) / 5) + (365 * y) + Math.floor(y / 4) - 32083;
	}
	
	const t = ((date.getUTCHours() - 12) / 24) + (date.getUTCMinutes() / 1440) + (date.getUTCSeconds() / 86400);
	return jdn + t;

}

export function getEpochSeconds(jd) {
	return (jd - J2000) * DAY;
}
