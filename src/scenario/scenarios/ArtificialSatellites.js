/** 

Corrections have been added to element's altitude to compensate for imprecisions in parameters, so as to fit mechanical orbit to orbital elements.

*/
import { DAY } from '../../core/constants';
import { earth } from './bodies/earth';
import { Mercury7, Mercury8 } from './NasaNumbers';
import { getJD } from '../../utils/JD';

export default {
	name: 'Artificial',
	title: 'Artificial satellites around the Earth',
	commonBodies: [earth],
	bodies: {
		/*earth: {
			map: './assets/img/earthmap1k_KSC.jpg'
		},/**/
		//https://books.google.ca/books?id=lZWZXbOKZvEC&pg=PA107&lpg=PA107&dq=sputnik+1+argument+of+perigee&source=bl&ots=UjcyyLTQBQ&sig=4UAJgXkoSVUSkiLkbvSM5-jm3vM&hl=en&sa=X&ved=0ahUKEwjcwqTq1u3RAhVj7YMKHZV4DN44ChDoAQg1MAQ#v=onepage&q=sputnik%201%20argument%20of%20perigee&f=false
		sputnik1: {
			title: 'Sputnik 1',
			mass: 84,
			radius: 2,
			color: '#ffffff',
			relativeTo: 'earth',
			orbit: {
				base: {
					a: ((earth.radius * 2) + 228 + 947) / 2,
					e: 0.0517,
					w: 41,
					M: 0,
					i: 65.128,
					o: 0,
				},
				day: {
					a: 0,
					e: 0,
					i: 0,
					M: (360 / (96.17 * 60)) * DAY,
					w: 0.432,
					o: 0,
				},
			},
		},
		mercury6: {
			title: 'Mercury 6',
			mass: 1224.7,
			radius: 2,
			color: '#ffffff',
			relativeTo: 'earth',
			orbit: {
				base: {
					a: ((earth.radius * 2) + 159 + 265) / 2,
					e: 0.00804,
					w: 0,
					M: 0,
					i: 32.5,
					o: 0,
				},
				day: {
					a: 0,
					e: 0,
					i: 0,
					M: (360 / (88.5 * 60)) * DAY,
					w: 0,
					o: 0,
				},
			},
		},
		mercury7: Object.assign(
			{
				title: 'Mercury 7',
				mass: 1,
				radius: 2,
				color: '#ffffff',
			},
			Mercury7.getNumbers()
		),
		mercury8: Object.assign(
			{
				title: 'Mercury 8',
				mass: 1,
				radius: 2,
				color: '#ffffff',
			},
			Mercury8.getNumbers()
		),
		hubble: {
			title: 'Hubble ST',
			mass: 11110,
			radius: 2,
			color: '#ffaa00',
			relativeTo: 'earth',
			orbit: {
				base: {
					a: (earth.radius + 11 + 586.47),
					e: 0.00172,
					w: 0,
					M: 0,
					i: 28.48,
					o: 0,
				},
				day: {
					a: 0,
					e: 0,
					i: 0,
					M: (360 / (96.66 * 60)) * DAY,
					w: 0,
					o: 0,
				},
			},

		},
		gemini6: {
			title: 'Gemini 6A',
			mass: 1,
			radius: 2,
			color: '#00aaff',
			relativeTo: 'earth',
			orbit: {
				base: {
					a: ((earth.radius * 2) + 161 + 259.4) / 2,
					e: 0.0003,
					w: 0,
					M: 0,
					i: 28.89,
					o: 0,
				},
				day: {
					a: 0,
					e: 0,
					i: 0,
					M: (360 / (90.55 * 60)) * DAY,
					w: 0,
					o: 0,
				},
			},
		},
	},
	
	secondsPerTick: { min: 1, max: 10, initial: 5 },
	help: "A selection of artificial satellites orbiting the Earth. They were not launched in the same years, so the epoch is irrelevent in this simulation. The numbers I have for these orbits are incomplete. The shape and inclination of the orbits are correct, but I don't have epoch and orientation information. I included this scenario to show the differences between these satellite's orbits shapes.",

};
