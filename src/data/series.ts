/**
 Access to the VSOP87 and ELP2000 series. They are large, so they are not bundled: they are loaded as classic scripts
 (public/assets/data/*.js) that register them on window.vsop and window.elp before the app starts.
 */

export interface VsopSeries {
	/** coordinate index (1: x, 2: y, 3: z) */
	ic: number;
	/** power of time */
	it: number;
	/** [amplitude, phase, frequency] */
	series: [number, number, number][];
}

/** a line of an ELP2000 file: integer arguments followed by coefficients */
export type ElpLine = number[];

declare global {
	var vsop: Record<string, VsopSeries[]> | undefined;
	var elp: Record<string, ElpLine[]> | undefined;
}

export function getVsopSeries(body: string): VsopSeries[] {
	const series = globalThis.vsop && globalThis.vsop[body];
	if (!series) throw new Error(`VSOP87 series for ${body} are not loaded`);
	return series;
}

export function getElpSeries(file: string): ElpLine[] | undefined {
	return globalThis.elp && globalThis.elp[file];
}
