 /**
 //THREE.js does not render right when distances are too large, as for example if the unit in three.js corresponded to one meter in the solar system
 */

import { Vector3 } from 'three';

export default {
	scale: 1,

	setLargestDimension(dim) {
		// console.log(dim);
		this.scale = 1000 / dim;
	},

	getScaled(obj) {
		//
		if (obj instanceof Vector3) {
			return obj.multiplyScalar(this.scale);
		} 
		return obj * this.scale;
	},
	
};
