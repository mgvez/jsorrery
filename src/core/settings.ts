import type { GuiSettings } from '../scenario/types';

declare global {
	interface Window {
		/** a page embedding jsOrrery can set default settings, e.g. window.jsOrrery = { defaults: { scenario: 'InnerSolarSystem' } } */
		jsOrrery?: { defaults?: GuiSettings };
	}
}

/**
 Initial settings of the app: the page's defaults (window.jsOrrery.defaults), overridden by the query string
 (as produced by the share link: ?scenario=...&date=...&cx=...).
 */
export function getInitialSettings(search = window.location.search): GuiSettings {
	const settings: GuiSettings & Record<string, unknown> = { ...(window.jsOrrery && window.jsOrrery.defaults) };
	const params = new URLSearchParams(search);
	params.forEach((value, key) => {
		settings[key] = value;
	});

	if (params.has('cx')) {
		settings.cameraSettings = {
			x: params.get('cx') ?? undefined,
			y: params.get('cy') ?? undefined,
			z: params.get('cz') ?? undefined,
			fov: params.get('fov') ?? undefined,
		};
	}

	return settings;
}

/**
 Parses a date typed by the user. ISO dates with years beyond 4 digits or negative years (e.g. -2000-01-01T00:00) are
 supported. Unparsable dates fall back to the current date.
 */
export function parseDateInput(str: string): Date {
	const m = str && str.trim().match(/(-?\d{1,6})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
	let date: Date;
	if (m) {
		date = new Date(Date.UTC(2000, Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5])));
		//set separately: Date.UTC maps years 0 to 99 to 1900-1999
		date.setUTCFullYear(Number(m[1]));
	} else {
		date = new Date(str);
	}
	if (Number.isNaN(date.getTime())) {
		date = new Date();
	}
	return date;
}
