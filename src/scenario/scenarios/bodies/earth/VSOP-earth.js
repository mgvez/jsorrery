import { Vector3 } from 'three';
import { AU, KM, J2000 } from '../../../../core/constants';
import { getJ2000SecondsFromJD } from '../../../../utils/JD';

/*subroutine VSOP87 (tdj,ivers,ibody,prec,lu,r,ierr)
*-----------------------------------------------------------------------
*
*     Reference : Bureau des Longitudes - PBGF9502
*
*     Object :
*
*     Substitution of time in VSOP87 solution written on a file.
*     The file corresponds to a version of VSOP87 theory and to a body.
*
*     Input :
*
*     tdj      julian date (real double precision).
*              time scale : dynamical time TDB.
*
*     ivers    version index (integer).
*              0: VSOP87 (initial solution).
*                 elliptic coordinates
*                 dynamical equinox and ecliptic J2000.
*              1: VSOP87A.
*                 rectangular coordinates
*                 heliocentric positions and velocities
*                 dynamical equinox and ecliptic J2000.
*              2: VSOP87A.
*                 spherical coordinates
*                 heliocentric positions and velocities
*                 dynamical equinox and ecliptic J2000.
*              3: VSOP87C.
*                 rectangular coordinates
*                 heliocentric positions and velocities
*                 dynamical equinox and ecliptic of the date.
*              4: VSOP87D.
*                 spherical coordinates
*                 heliocentric positions and velocities
*                 dynamical equinox and ecliptic of the date.
*              5: VSOP87E.
*                 rectangular coordinates
*                 barycentric positions and velocities
*                 dynamical equinox and ecliptic J2000.
*
*     ibody    body index (integer).
*              0: Sun
*              1: Mercury
*              2: Venus
*              3: Earth
*              4: Mars
*              5: Jupiter
*              6: Saturn
*              7: Uranus
*              8: Neptune
*              9: Earth-Moon barycenter
*
*     prec     relative precision (real double precision).
*
*              if prec is equal to 0 then the precision is the precision
*                 p0 of the complete solution VSOP87.
*                 Mercury    p0 =  0.6 10**-8
*                 Venus      p0 =  2.5 10**-8
*                 Earth      p0 =  2.5 10**-8
*                 Mars       p0 = 10.0 10**-8
*                 Jupiter    p0 = 35.0 10**-8
*                 Saturn     p0 = 70.0 10**-8
*                 Uranus     p0 =  8.0 10**-8
*                 Neptune    p0 = 42.0 10**-8
*
*              if prec is not equal to 0, let us say in between p0 and
*              10**-2, the precision is :
*                 for the positions :
*                 - prec*a0 au for the distances.
*                 - prec rd for the other variables.
*                 for the velocities :
*                 - prec*a0 au/day for the distances.
*                 - prec rd/day for the other variables.
*                   a0 is semi-major axis of the body.
*                 Mercury    a0 =  0.3871 ua
*                 Venus      a0 =  0.7233 ua
*                 Earth      a0 =  1.0000 ua
*                 Mars       a0 =  1.5237 ua
*                 Jupiter    a0 =  5.2026 ua
*                 Saturn     a0 =  9.5547 ua
*                 Uranus     a0 = 19.2181 ua
*                 Neptune    a0 = 30.1096 ua
*
*     lu       logical unit index of the file (integer).
*              The file corresponds to a version of VSOP87 theory and
*              a body, and it must be defined and opened before the
*              first call to subroutine VSOP87.
*
*     Output :
*
*     r(6)     array of the results (real double precision).
*
*              for elliptic coordinates :
*                  1: semi-major axis (au)
*                  2: mean longitude (rd)
*                  3: k = e*cos(pi) (rd)
*                  4: h = e*sin(pi) (rd)
*                  5: q = sin(i/2)*cos(omega) (rd)
*                  6: p = sin(i/2)*sin(omega) (rd)
*                     e:     eccentricity
*                     pi:    perihelion longitude
*                     i:     inclination
*                     omega: ascending node longitude
*
*              for rectangular coordinates :
*                  1: position x (au)
*                  2: position y (au)
*                  3: position z (au)
*                  4: velocity x (au/day)
*                  5: velocity y (au/day)
*                  6: velocity z (au/day)
*
*              for spherical coordinates :
*                  1: longitude (rd)
*                  2: latitude (rd)
*                  3: radius (au)
*                  4: longitude velocity (rd/day)
*                  5: latitude velocity (rd/day)
*                  6: radius velocity (au/day)
*
*     ierr     error index (integer).
*                  0: no error.
*                  1: file error (check up ivers index).
*                  2: file error (check up ibody index).
*                  3: precision error (check up prec parameter).
*                  4: reading file error.
*
*/
const prec = 0;
const dpi = 6.283185307179586;
const a1000 = 365250;
const k = 0;

export function VSOP(jd) {

	const r = [0, 0, 0, 0, 0, 0];

	const t = [1];
	t[1] = (jd - J2000) / a1000;
	for (let i = 2; i <= 5; i++) {
		t[i] = t[1] * t[i - 1];
	}

	const q = Math.max(3, -Math.log10(prec + 1e-50));
	
	window.vsop.earth.forEach(params => {
		const { it, ic, series } = params;

		const t0 = t[it] || 0;
		const t1 = t[it - 1] || 0;
		const p = prec / 10 / (q - 2) / (Math.abs(t0) + it * Math.abs(t1) * 1e-4 + 1e-50);
		const n = series.length;
		// console.log(it, ic);
		for (let i = 0; i < n; i++) {

			const a = series[i][0];
			const b = series[i][1];
			const c = series[i][2];
			
			// console.log(series[i].length);

			if (Math.abs(a) < p) {
				break;
			}
			const u = b + c * t[1];
			const cu = Math.cos(u);
			r[ic] += a * cu * t[it];
			const su = Math.sin(u);
			r[ic + 3] = r[ic + 3] + t[it - 1] * it * a * cu - t[it] * a * c * su;
		}

	});

	for (let i = 4; i <= 6; i++) {
		r[i] /= a1000;
	}
	r[k] %= dpi;
	if (r[k] < 0) r[k] += dpi;
	
	return new Vector3(r[1] * AU * KM, r[2] * AU * KM, r[3] * AU * KM);
}
