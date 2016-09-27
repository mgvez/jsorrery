
let vals = {};
let cam;

export default {
	reset() {
		vals = {};
	},

	setVal(k, v) {
		vals[k] = v;
	},

	setCamera(camera) {
		cam = camera;
	},

	getExport() {
		return Object.assign({}, vals, { cx: cam.position.x, cy: cam.position.y, cz: cam.position.z, fov: cam.fov });
	},
};
