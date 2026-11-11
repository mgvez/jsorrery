import { Vector3 } from 'three';
import { G } from '../core/constants';
import type CelestialBody from '../core/CelestialBody';

/**
Calculates the forces that are created by each body toward one another
*/
export function calculateGForces(bodies: CelestialBody[]) {
	let workVect = new Vector3();

	for (let i = 0; i < bodies.length; i++) {
		if (!i) bodies[i].force.x = bodies[i].force.y = bodies[i].force.z = 0;
		for (let j = i + 1; j < bodies.length; j++) {
			if (!i) bodies[j].force.x = bodies[j].force.y = bodies[j].force.z = 0;
			const skipComputation = (
				(bodies[i].mass === 1 && bodies[j].mass === 1)
				||
				(bodies[i].useCustomComputation && bodies[j].useCustomComputation)
			);
			if (!skipComputation) {
				workVect = getGForceBetween(bodies[i].mass, bodies[j].mass, bodies[i].position, bodies[j].position);
				//add forces (for the first body, it is the reciprocal of the calculated force)
				bodies[i].force.sub(workVect);
				bodies[j].force.add(workVect);
			}
		}
	}
}

/**
Get the gravitational force in Newtons between two bodies (their distance in m, mass in kg)
*/
export function getGForceBetween(mass1: number, mass2: number, pos1: Vector3, pos2: Vector3) {
	const workVect = new Vector3();
	//vector is between positions of body A and body B
	workVect.copy(pos1).sub(pos2);
	const dstSquared = workVect.lengthSq();
	const massPrd = mass1 * mass2;
	//in newtons (1 N = 1 kg*m / s^2)
	const Fg = G * (massPrd / dstSquared);
	workVect.normalize();
	//vector is now force of attraction in newtons
	workVect.multiplyScalar(Fg);
	return workVect;
}
