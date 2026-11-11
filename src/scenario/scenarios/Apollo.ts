import { getMissionFromName, getMissionNumbers } from './NasaNumbers';
import { earth } from './bodies/earth';
import { moon } from './bodies/moon';
import { getDateFromJD } from '../../utils/JD';
import type CelestialBody from '../../core/CelestialBody';
import type { BodyDefinition, ScenarioDefinition } from '../types';

//the mission can be chosen in the url (?apollo=8)
const g = typeof window !== 'undefined' ? window.location.search.match(/apollo=([0-9]+)/) : null;
const apolloNumber = (g && g[1]) || '11';
const apolloTLIOrbit = getMissionNumbers(getMissionFromName(`Apollo${apolloNumber}`)!, 'TLI')!;
const epoch = getDateFromJD(apolloTLIOrbit.orbit!.epoch!);

//apollo 8, 10, 12, 15, 16 work better with moon position calculated from physics
//apollo 11, 14 work better with moon position always calculated from elements
//apollo 13, 17 don't work at all
//I chose to use the way it works better for each mission. Even if it seems like cheating, the goal of the simulation is to show an approximation of the free return trajectory, and it does not pretend to be as accurate as Nasa could get it. All the numbers involved come from different sources, and I don't know how accurate they are anyway, so better show something plausible instead of seeking perfect accuracy.
const useCustomComputation = false;

interface TripData {
	hasTLILabel?: boolean;
	isOnReturnTrip?: boolean;
	lastMoonDist?: number;
	minMoonDist?: number;
	minMoonSpeed?: number;
	minSpeed?: number;
	lastEarthDist?: number;
	minEarthDist?: number;
}

const apolloBase: BodyDefinition = {
	title: `Apollo ${apolloNumber}`,
	relativeTo: 'earth',
	mass: 1,
	radius: 2,
	color: '#00ffff',
	traceColor: '#ffffff',
	vertexDist: 100000,
	forceTrace: true,
	showSolidOrbit: true,
	data: {},
	logForces: true,
};

function distanceToBody(spacecraft: CelestialBody, name: string) {
	const body = spacecraft.universe.getBody(name);
	return (Math.abs(spacecraft.position.clone().sub(body.position).length()) / 1000) - body.radius;
}

const apolloTLI: BodyDefinition = {
	...apolloBase,
	customInitialize() {
		this.data = {};
	},
	customAfterTick(deltaT) {
		const data = this.data as TripData;
		const relativeTo = this.universe.getBody(this.relativeTo);
		let dist: number;

		if (!data.isOnReturnTrip) {
			if (!data.hasTLILabel && this.relativePosition.x !== 0) {
				this.universe.addEventLabel('Trans Lunar Injection', this.relativePosition.clone(), relativeTo);
				data.hasTLILabel = true;
			}

			dist = distanceToBody(this, 'moon');
			let moonSpeed = 0;
			if (data.lastMoonDist) {
				moonSpeed = ((data.lastMoonDist - dist) / deltaT) * 1000;
			}

			if (!data.minMoonDist || dist < data.minMoonDist) {
				data.minMoonDist = dist;
			} else if (data.lastMoonDist === data.minMoonDist) {
				this.universe.addEventLabel(`Closest distance to<br>the Moon: ${Math.round(data.minMoonDist)} km`, this.previousRelativePosition.clone(), relativeTo);
				data.isOnReturnTrip = true;
			}

			data.lastMoonDist = dist;
			data.minMoonSpeed = !data.minMoonSpeed || (data.minMoonSpeed > moonSpeed) ? moonSpeed : data.minMoonSpeed;
			data.minSpeed = !data.minSpeed || (data.minSpeed > this.speed) ? this.speed : data.minSpeed;
		} else {
			dist = distanceToBody(this, 'earth');
			if (!data.minEarthDist || dist < data.minEarthDist) {
				data.minEarthDist = dist;
			} else if (data.lastEarthDist === data.minEarthDist && dist < (Math.abs(this.position.clone().sub(this.universe.getBody('moon').position).length()) / 1000)) {
				this.universe.addEventLabel(`Closest distance to<br>the Earth: ${Math.round(data.minEarthDist)} km<br>Simulation stopped`, this.previousRelativePosition.clone(), relativeTo);
				this.universe.stop();
			}

			data.lastEarthDist = dist;
		}
	},
};

const scenario: ScenarioDefinition = {
	usePhysics: true,
	name: 'Apollo',
	title: `Apollo ${apolloNumber} free return trajectory`,
	commonBodies: [earth, moon],
	secondsPerTick: { min: 100, max: 500, initial: 200 },
	calculationsPerTick: 200,
	useBarycenter: false,
	forcedGuiSettings: {
		date: epoch,
		scale: 1,
	},
	bodies: {
		earth: {},
		moon: {
			useCustomComputation,
			forceMaxPrecision: true,
			showSolidOrbit: true,
			resetPosAtTick: true,
		},
		apolloTLI: {
			...apolloTLI,
			...apolloTLIOrbit,
			title: `Apollo ${apolloNumber}`,
		},
	},
	help: "Paths of Apollo <a href=\"http://en.wikipedia.org/wiki/Free_return_trajectory\" target=\"_blank\">free return trajectories</a> are calculated from data available on Nasa's website. Data for every Moon mission is available, but all don't work perfectly in the simulation. I chose to display Apollo 8, because it was the first mission to get to the moon. The return path doesn't get exactly to Earth's atmosphere, but keep in mind that the simulated trajectory that you see here does not depend solely on Apollo's numbers, but also on the Moon's and the Earth's calculated positions, velocities and masses. Furthermore, I can't pretend that the algorithm I programmed to calculate the forces resulting from gravity is on par with what Nasa scientists can do. Still, the simulation is precise enough to get a very good idea of the shape of the free return trajectory and the genius behind it.",
};

export default scenario;
