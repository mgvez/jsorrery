/*
	Global vars
*/

//gravitational constant to measure the force with masses in kg and radii in meters N(m/kg)^2
export const G = 6.6742e-11;
//astronomical unit in km
export const AU = 149597870;
export const CIRCLE = 2 * Math.PI;
export const QUARTER_CIRCLE = Math.PI / 2;
export const KM = 1000;
export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

export const NM_TO_KM = 1.852;
export const LB_TO_KG = 0.453592;
export const LBF_TO_NEWTON = 4.44822162;
export const FT_TO_M = 0.3048;

//use physics or orbital elements to animate
export const USE_PHYSICS_BY_DEFAULT = false;

//duration in seconds
export const DAY = 60 * 60 * 24;
//duration in days
export const YEAR = 365.25;
//duration in days
export const CENTURY = 100 * YEAR;
export const SIDEREAL_DAY = 3600 * 23.9344696;

// export const J2000 = new Date('2000-01-01T12:00:00-00:00');
export const J2000 = 2451545;

export const DEFAULT_CALCULATIONS_PER_TICK = 10;

export const IS_SCREENSHOT = false;
export const IS_CAPTURE = false;
