
// source http://ssd.jpl.nasa.gov/?sat_elem
import { jupiter } from './bodies/jupiter';

export default {
	name: 'JupiterMoon',
	title: 'Jupiter and Gallilean satellites',
	help: 'This scenario was included to see if it was possible to simulate <a href="http://en.wikipedia.org/wiki/Orbital_resonance" target="_blank">Laplace resonance</a>.',
	commonBodies: [jupiter],
	forcedGuiSettings: {
		scale: 1,
	},
	bodies: {
		io: {
			title: 'Io',
			mass: 893.2e20,
			radius: 1821.6,
			color: '#999999',
			orbit: {
				base: {
					a: 421800,
					e: 0.0041,
					w: 84.129,
					M: 342.021,
					i: 0.036,
					o: 43.977,
				},
				day: {
					a: 0,
					e: 0,
					i: 0,
					M: 203.4889583,
					w: 0,
					o: 0,
				},
			},
		},
		europa: {
			title: 'Europa',
			mass: 480.0e20,
			radius: 1560.8,
			color: '#999999',
			orbit: {
				base: {
					a: 671100,
					e: 0.0094,
					w: 88.970,
					M: 171.016,
					i: 0.466,
					o: 219.106,
				},
				day: {
					a: 0,
					e: 0,
					i: 0,
					M: 101.3747242,
					w: 0,
					o: 0,
				},
			},
		},
		ganymede: {
			title: 'Ganymede',
			mass: 1481.9e20,
			radius: 2631.2,
			color: '#999999',
			orbit: {
				base: {
					a: 1070400,
					e: 0.0013,
					w: 192.417,
					M: 317.540,
					i: 0.177,
					o: 63.552,
				},
				day: {
					a: 0,
					e: 0,
					i: 0,
					M: 50.3176072,
					w: 0,
					o: 0,
				},
			},
		},
		callisto: {
			title: 'Callisto',
			mass: 1075.9e20,
			radius: 2410.3,
			color: '#999999',
			orbit: {
				base: {
					a: 1882700,
					e: 0.0074,
					w: 52.643,
					M: 181.408,
					i: 0.192,
					o: 298.848,
				},
				day: {
					a: 0,
					e: 0,
					i: 0,
					M: 21.5710728,
					w: 0,
					o: 0,
				},
			},
		},
	},
	secondsPerTick: { min: 100, max: 3600, initial: 500 },
};

/*
Io	421800.	0.0041	84.129	342.021	0.036	43.977	203.4889583	1.769	1.625	7.420	268.057	64.495	0.000	11
Europa	671100.	0.0094	88.970	171.016	0.466	219.106	101.3747242	3.551	1.394	30.184	268.084	64.506	0.016	11
Ganymede	1070400.	0.0013	192.417	317.540	0.177	63.552	50.3176072	7.155	63.549	132.654	268.168	64.543	0.068	11
Callisto	1882700.	0.0074	52.643	181.408	0.192	298.848	21.5710728	16.69	205.75	338.82	268.639	64.749	0.356	11
Amalthea	181400.	0.0032	155.873	185.194	0.380	108.946	722.6317143	0.498	0.196	0.393	268.057	64.495	0.000	11
Thebe	221900.	0.0176	234.269	135.956	1.080	235.694	533.7002568	0.675	0.398	0.797	268.057	64.495	0.000	11
Adrastea	129000.	0.0018	328.047	135.673	0.054	228.378	1206.9988064	0.298	0.058	0.116	268.057	64.496	0.000	11
Metis	128000.	0.0012	297.177	276.047	0.019	146.912	1221.2545982	0.295	0.057	0.115	268.057	64.496	0.000	11
/**/
