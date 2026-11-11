
export function sinh(a: number) {
	return (Math.exp(a) - Math.exp(-a)) / 2;
}

export function cosh(a: number) {
	return ((Math.E ** a) + (Math.E ** -a)) / 2;
}

export function sign(a: number) {
	return (a >= 0.0) ? 1 : -1;
}
