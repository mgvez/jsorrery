export interface RGB {
	r: number;
	g: number;
	b: number;
}

export function hexToRgb(hex: string): RGB | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16),
	} : null;
}

export function rgbToHex(rgb: RGB) {
	return (rgb.r << 16) + (rgb.g << 8) + rgb.b;
}

export function darken(rgb: RGB, factor: number): RGB {
	const parsedFactor = 1 - factor;
	return {
		r: rgb.r * parsedFactor,
		g: rgb.g * parsedFactor,
		b: rgb.b * parsedFactor,
	};
}
