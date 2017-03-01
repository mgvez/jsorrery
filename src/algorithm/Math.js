
export function sinh(a) {
	return (Math.exp(a) - Math.exp(-a)) / 2;
}

export function cosh(a) {
	return ((Math.E ** a) + (Math.E ** -a)) / 2;
}

export function sign(a) {
	return (a >= 0.0) ? 1 : -1;
}
