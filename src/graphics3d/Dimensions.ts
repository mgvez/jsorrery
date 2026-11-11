/**
 three.js does not render right when distances are too large, as for example if the unit in three.js corresponded to one
 meter in the solar system. All distances are scaled so that the largest dimension of the scene is 1000 units.
 */

import { Vector3 } from 'three';

let scale = 1;

export function setLargestDimension(dim: number) {
	scale = 1000 / dim;
}

/** scales a distance in meters to scene units. Vectors are scaled in place. */
export function getScaled(obj: Vector3): Vector3;
export function getScaled(obj: number): number;
export function getScaled(obj: Vector3 | number): Vector3 | number {
	if (obj instanceof Vector3) {
		return obj.multiplyScalar(scale);
	}
	return obj * scale;
}
