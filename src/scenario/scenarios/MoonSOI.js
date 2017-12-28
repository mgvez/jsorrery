
import { earth } from './bodies/earth';
import { moon } from './bodies/moon';

export default {
	usePhysics: true,
	name: 'MoonSoi',
	title: 'SOI of the Moon',
	commonBodies: [moon, earth],
	secondsPerTick: { min: 3600, max: 3600 * 15, initial: 3600 * 5 },
	calculationsPerTick: 1000,
	forcedGuiSettings: {
		scale: 1,
	},
	help: "This scenario tests the Sphere of inlufence of the Moon's gravitational field over the Earth's. We have bodies orbiting the Moon that are set inside or outside of the Moon's SOI, to observe what happens.",
	bodies: {
		moon: {
			/*relativeTo: null,
			isCentral: true/**/
		}, /**/
		inside: {
			mass: 100,
			title: 'Inside SOI',
			color: '#aaaaff',
			radius: 3,
			orbit: {
				base: {
					a: 22000,
					e: 0,
					w: 0,
					M: 0,
					i: 0,
					o: 141,
				},
				day: {
					a: 0,
					e: 0,
					i: 0,
					M: 1,
					w: 0,
					o: 0,
				},
			},
			relativeTo: 'moon',
			forceTrace: true,
			traceRelativeTo: 'earth', /**/
		},
		outside: {
			mass: 100,
			title: 'Outside SOI',
			color: '#ffaaaa',
			radius: 3,
			orbit: {
				base: {
					a: 100000,
					e: 0,
					w: 0,
					M: 0,
					i: 0,
					o: 49,
				},
				day: {
					a: 0,
					e: 0,
					i: 0,
					M: 1,
					w: 0,
					o: 0,
				},
			},
			relativeTo: 'moon',
			forceTrace: true,
			traceRelativeTo: 'earth', /**/
		},
		limit: {
			mass: 100,
			title: 'Limit of SOI',
			color: '#aaaaff',
			radius: 3,
			orbit: {
				base: {
					a: 40000,
					e: 0,
					w: 0,
					M: 0,
					i: 0,
					o: 319,
				},
				day: {
					a: 0,
					e: 0,
					i: 0,
					M: 1,
					w: 0,
					o: 0,
				},
			},
			relativeTo: 'moon',
			forceTrace: true,
			traceRelativeTo: 'earth',
		},
	},
};
