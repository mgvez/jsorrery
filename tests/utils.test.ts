import { describe, expect, it, vi } from 'vitest';
import { parseDateInput } from '../src/core/settings';
import GeoCoord from '../src/utils/GeoCoord';
import { getDateFromJD, getJD } from '../src/utils/JD';
import { J2000 } from '../src/core/constants';
import { createStore } from '../src/state/store';

describe('parseDateInput', () => {
	it('parses ISO dates', () => {
		expect(parseDateInput('2017-08-21T18:25:00.000Z').toISOString()).toBe('2017-08-21T18:25:00.000Z');
	});

	it('parses years beyond 4 digits, negative years and years before 100', () => {
		expect(parseDateInput('-2000-03-01T12:00').getUTCFullYear()).toBe(-2000);
		expect(parseDateInput('12000-03-01T12:00').getUTCFullYear()).toBe(12000);
		expect(parseDateInput('0050-03-01T12:30').toISOString()).toBe('0050-03-01T12:30:00.000Z');
	});

	it('falls back to now for invalid input', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2020-01-01T00:00:00Z'));
		expect(parseDateInput('not a date').toISOString()).toBe('2020-01-01T00:00:00.000Z');
		vi.useRealTimers();
	});
});

describe('GeoCoord', () => {
	it.each([
		['46.8139, -71.2080', 46.8139, -71.208],
		['40.446° N 79.982° W', 40.446, -79.982],
		['40° 26.767′ N 79° 58.933′ W', 40 + 26.767 / 60, -(79 + 58.933 / 60)],
		['40° 26′ 46″ N 79° 58′ 56″ W', 40 + 26 / 60 + 46 / 3600, -(79 + 58 / 60 + 56 / 3600)],
	])('parses %s', (input, lat, lng) => {
		const loc = new GeoCoord().setFromString(input);
		expect(loc.lat).toBeCloseTo(lat, 6);
		expect(loc.lng).toBeCloseTo(lng, 6);
	});

	it('formats with 4 decimals', () => {
		expect(new GeoCoord(36.9664, -87.6709).getString()).toBe('36.9664, -87.6709');
	});
});

describe('julian dates', () => {
	it('converts J2000', () => {
		expect(getJD(new Date('2000-01-01T12:00:00Z'))).toBe(J2000);
		expect(getDateFromJD(J2000).toISOString()).toBe('2000-01-01T12:00:00.000Z');
	});
});

describe('store', () => {
	it('notifies subscribers only when the state changes', () => {
		const store = createStore({ a: 1, b: 'x' });
		const listener = vi.fn();
		const unsubscribe = store.subscribe(listener);
		store.setState({ a: 1 });
		expect(listener).not.toHaveBeenCalled();
		store.setState({ a: 2 });
		expect(listener).toHaveBeenCalledTimes(1);
		expect(store.getState()).toEqual({ a: 2, b: 'x' });
		unsubscribe();
		store.setState({ b: 'y' });
		expect(listener).toHaveBeenCalledTimes(1);
	});
});
