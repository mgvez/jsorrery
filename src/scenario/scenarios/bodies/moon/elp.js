/* eslint-disable */
import { Vector3 } from 'three';
import { KM } from '../../../../core/constants';
/*-----------------------------------------------------------------------
*
*     Reference : Bureau des Logitudes - MCTJCGF9502.
*
*     Object :
*     Computation of geocentric lunar coordinates from ELP 2000-82 and
*     ELP2000-85 theories (M. Chapront-Touze and J. Chapront).
*     Constants fitted to JPL's ephemerides DE200/LE200.
*
*     Input :
*     tjj    julian date TDB (real double precision).
*     prec   truncation level in radian (real double precision).
*     nulog  number of logical unit for reading the files (integer).
*
*     Output :
*     r[3]   table of rectangular coordinates (real double precision).
*            reference frame : mean dynamical ecliptic and inertial
*            equinox of J2000 (JD 2451545.0).
*            r[1] : X (kilometer).
*            r[2] : Y (kilometer).
*            r[3] : Z (kilometer).
*     ierr   error index (integer).
*            ierr=0 : no error.
*            ierr=1 : error in elp 2000-82 files (end of file).
*            ierr=2 : error in elp 2000-82 files (reading error).
*
*     Remarks :
*     36 data files include the series related to various components of
*     the theory for the 3 spherical coordinates : longitude, latitude
*     and distance.
*     Files, series, constants and coordinate systems are described in
*     the notice LUNAR SOLUTION ELP 2000-82B.
*
*-----------------------------------------------------------------------
*/



const cpi = Math.PI;
const cpi2 = 2 * cpi;
const pis2 = cpi / 2;
const rad = 648000 / cpi;
const deg = cpi / 180;
const c1 = 60;
const c2 = 3600;
const ath = 384747.9806743165;
const a0 = 384747.9806448954;
const am = 0.074801329518;
const alfa = 0.002571881335;
const dtasm = 2 * alfa / (3 * am);

const w = [
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
];
const eart = [0, 0, 0, 0, 0, 0];
const peri = [0, 0, 0, 0, 0, 0];
const p = [
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0],
];

const del = [
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
];
const zeta = [0, 0, 0];

/*
*     Lunar arguments.
*/
w[1][1] = (218 + 18 / c1 + 59.95571 / c2) * deg;
w[2][1] = (83 + 21 / c1 + 11.67475 / c2) * deg;
w[3][1] = (125 + 2 / c1 + 40.39816 / c2) * deg;
eart[1] = (100 + 27 / c1 + 59.22059 / c2) * deg;
peri[1] = (102 + 56 / c1 + 14.42753 / c2) * deg;

w[1][2] = 1732559343.73604 / rad;
w[2][2] = 14643420.2632 / rad;
w[3][2] = -6967919.3622 / rad;
eart[2] = 129597742.2758 / rad;
peri[2] = 1161.2283 / rad;

w[1][3] = -5.8883 / rad;
w[2][3] = -38.2776 / rad;
w[3][3] = 6.3622 / rad;
eart[3] = -0.0202 / rad;
peri[3] = 0.5327 / rad;

w[1][4] = 0.6604 * 1e-2 / rad;
w[2][4] = -0.45047 * 1e-1 / rad;
w[3][4] = 0.7625 * 1e-2 / rad;
eart[4] = 0.9 * 1e-5 / rad;
peri[4] = -0.138 * 1e-3 / rad;

w[1][5] = -0.3169 * 1e-4 / rad;
w[2][5] = 0.21301 * 1e-3 / rad;
w[3][5] = -0.3586 * 1e-4 / rad;
eart[5] = 0.15 * 1e-6 / rad;
peri[5] = 0;
/*
*     Planetary arguments.
*/
const preces = 5029.0966 / rad;
p[1][1] = (252 + 15 / c1 + 3.25986 / c2) * deg;
p[2][1] = (181 + 58 / c1 + 47.28305 / c2) * deg;
p[3][1] = eart[1];
p[4][1] = (355 + 25 / c1 + 59.78866 / c2) * deg;
p[5][1] = (34 + 21 / c1 + 5.34212 / c2) * deg;
p[6][1] = (50 + 4 / c1 + 38.89694 / c2) * deg;
p[7][1] = (314 + 3 / c1 + 18.01841 / c2) * deg;
p[8][1] = (304 + 20 / c1 + 55.19575 / c2) * deg;
p[1][2] = 538101628.68898 / rad;
p[2][2] = 210664136.43355 / rad;
p[3][2] = eart[2];
p[4][2] = 68905077.59284 / rad;
p[5][2] = 10925660.42861 / rad;
p[6][2] = 4399609.65932 / rad;
p[7][2] = 1542481.19393 / rad;
p[8][2] = 786550.32074 / rad;

/*
*     Corrections of the constants (fit to DE200/LE200).
*/
const delnu = 0.55604 / rad / w[1][2];
const dele = 0.01789 / rad;
const delg = -0.08066 / rad;
const delnp = -0.06424 / rad / w[1][2];
const delep = -0.12879 / rad;
/*
*     Delaunay's arguments.
*/

for (let i = 1; i < 6; i++) {
	del[1][i] = w[1][i] - eart[i];
	del[4][i] = w[1][i] - w[3][i];
	del[3][i] = w[1][i] - w[2][i];
	del[2][i] = eart[i] - peri[i];
}
del[1][1] = del[1][1] + cpi;
zeta[1] = w[1][1];
zeta[2] = w[1][2] + preces;

/*
*     Precession matrix.
*/
const p1 = 0.10180391 * 1e-4;
const p2 = 0.47020439 * 1e-6;
const p3 = -0.5417367 * 1e-9;
const p4 = -0.2507948 * 1e-11;
const p5 = 0.463486 * 1e-14;
const q1 = -0.113469002 * 1e-3;
const q2 = 0.12372674 * 1e-6;
const q3 = 0.1265417 * 1e-8;
const q4 = -0.1371808 * 1e-11;
const q5 = -0.320334 * 1e-14;

function getData(n) {
	const fic = 'ELP' + n;//write(fic,2000)ific
	return window.elp && window.elp[fic];
}

export function ELP82B(jd, maxiter = 0, prec = 0) {
	
	const tjj = jd;
	// const tjj = (epochTime / (3600 * 24)) + 2451545;
	// const tjj = getJD(epochTime);
	// console.log(tjj);

	const pre = [0, 0, 0, 0];
	const t = [0, 0, 0, 0, 0, 0];

	t[1] = 1;

	const r = [0, 0, 0, 0];

	t[2] = (tjj - 2451545) / 36525;
	t[3] = t[2] * t[2];
	t[4] = t[3] * t[2];
	t[5] = t[4] * t[2];
	pre[1] = prec * rad;
	pre[2] = prec * rad;
	pre[3] = prec * ath;

	let ific = 1;
	let ierr = 0;

	function doLoop(ific) {

		if (ific === maxiter) return coordinates();

		if (ific <= 3) {
			return mainProblem(ific);
		} else if (ific <= 9) {
			return figTidesRel(ific);
		} else if (ific <= 21) {
			return planetaryPerturbations(ific);
		} else if (ific <= 36) {
			return figTidesRel(ific);
		} else {
			return coordinates();
		}
	}

	function mainProblem(ific) {
		
		const data = getData(ific);
		if (!data) return doLoop(++ific);

		const iv = ific;
		// console.time('ific'+ific);
		data.forEach(function mp210(line) {
			const lineData = [...line];
			const ilu = lineData.splice(0, 4);
			ilu.unshift(0);
			const coef = lineData;
			coef.unshift(0);
			// console.log(coef);
			let x = coef[1];
			if (Math.abs(x) < pre[iv]) return;
			const tgv = coef[2] + dtasm * coef[6];
			if (ific === 3) coef[1] = coef[1] - 2 * coef[1] * delnu / 3;
			x = coef[1] + tgv * (delnp - am * delnu ) + coef[3] * delg + coef[4] * dele + coef[5] * delep;
			let y = 0;//
			for (let k=1; k<=5; k++) {
				for (let i=1; i<5; i++) {
					y = y + ilu[i] * del[i][k] * t[k];
				}
			}

			if (iv === 3) y = y + pis2;//
			y = y % cpi2;//
			r[iv] = r[iv] + x * Math.sin(y);//RADs?
		});
		// console.timeEnd('ific'+ific);
		return doLoop(++ific);
	}

	/*
	*     Figures - Tides - Relativity - Solar eccentricity.
	*/
	function figTidesRel(ific) {
		const iv = ((ific-1) % 3) + 1;	
		
		const data = getData(ific);
		if (!data) return doLoop(++ific);
		// console.time('ific'+ific);
		
		data.forEach(function mp310(line) {

			const lineData = [...line];
			const iz = lineData.shift();
			const ilu = lineData.splice(0, 4);
			ilu.unshift(0);
			const pha = lineData.shift();
			let x = lineData.shift();
			const per = lineData.shift();

			if (x < pre[iv]) return;
			if (ific >= 7 && ific <= 9) x = x * t[2];
			if (ific >= 25 && ific <= 27) x = x * t[2];
			if (ific >= 34 && ific <= 36) x = x * t[3];
			let y = pha * deg;//
			for (let k = 1; k <= 2; k++) {
				y = y + iz * zeta[k] * t[k];//
				for (let i = 1; i <= 4; i++) {
					y = y + ilu[i] * del[i][k] * t[k];
				}
			}
			y = y % cpi2;//

			r[iv] = r[iv] + x * Math.sin(y);

		});
		// console.timeEnd('ific'+ific);
		return doLoop(++ific);
	}

	/*
	*     Planetary perturbations.
	*/
	function planetaryPerturbations(ific) {
		const iv = ((ific-1) % 3) + 1;

		const data = getData(ific);
		if (!data) return doLoop(++ific);
		// console.time('ific'+ific);
		data.forEach(function mp410(line, idx) {
			
			const lineData = [...line];
			const ipla = lineData.splice(0, 11);
			ipla.unshift(0);
			const pha = lineData.shift();
			let x = lineData.shift();
			const per = lineData.shift();

			if (x < pre[iv]) return;
			if (ific >= 13 && ific <= 15) x = x * t[2];
			if (ific >= 19 && ific <= 21) x = x * t[2];
			let y = pha * deg;
			if (ific >= 16) {
				for (let k = 1; k <= 2; k++) {
					for (let i=1; i <=4; i++) {
						y = y + ipla[i+7] * del[i][k] * t[k];
					}
					for (let i=1; i <=7; i++) {
						y = y + ipla[i] * p[i][k] * t[k];
					}
				}
			} else {
				for (let k = 1; k <= 2; k++) {
					y = y + (ipla[9] * del[1][k] + ipla[10] * del[3][k] + ipla[11] * del[4][k]) * t[k];
					for (let i = 1; i <= 8; i++) {
						y = y + ipla[i] * p[i][k] * t[k];
					}
				}
			}
			y = y % cpi2;
			r[iv] = r[iv] + x * Math.sin(y);
		});
		// console.timeEnd('ific'+ific);
		return doLoop(++ific);
	}

	/*
	*     Change of coordinates.
	*/
	function coordinates() {
		// console.time('end');
		
		r[1] = r[1] / rad + w[1][1] + w[1][2] * t[2] + w[1][3] * t[3] + w[1][4] * t[4] + w[1][5] * t[5];
		r[2] = r[2] / rad;
		r[3] = r[3] * a0 / ath;
		let x1 = r[3] * Math.cos(r[2]);
		const x2 = x1 * Math.sin(r[1]);
		x1 = x1 * Math.cos(r[1]);
		const x3 = r[3] * Math.sin(r[2]);
		let pw = (p1 + p2 * t[2] + p3 * t[3] + p4 * t[4] + p5 * t[5]) * t[2];
		let qw = (q1 + q2 * t[2] + q3 * t[3] + q4 * t[4] + q5 * t[5]) * t[2];
		const ra = 2 * Math.sqrt(1 - pw * pw - qw * qw);
		const pwqw = 2 * pw * qw;
		const pw2 = 1 - 2 * pw * pw;
		const qw2 = 1 - 2 * qw * qw;
		pw = pw * ra;
		qw = qw * ra;
		r[1] = pw2 * x1 + pwqw * x2 + pw * x3;
		r[2] = pwqw * x1 + qw2 * x2 - qw * x3;
		r[3] = -pw * x1 + qw * x2 + (pw2 + qw2 - 1) * x3;
		// console.timeEnd('end');
		return new Vector3(r[1] * KM, r[2] * KM, r[3] * KM);
	}

	return doLoop(1); 
}
