/*
	Global vars
*/


export function hexToRgb(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16),
	} : null;
}

export function rgbToHex(rgb) {
	return (rgb.r << 16) + (rgb.g << 8) + rgb.b;
}

export function darken(rgb, factor) {
	const parsedFactor = 1 - factor;
	return {
		r: rgb.r * parsedFactor,
		g: rgb.g * parsedFactor,
		b: rgb.b * parsedFactor,
	};
}
