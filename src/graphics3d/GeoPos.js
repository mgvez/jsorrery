import { Vector3, Euler, Mesh, SphereGeometry, MeshPhongMaterial } from 'three';
import { DEG_TO_RAD, CIRCLE } from 'constants';
import { getUniverse } from 'JSOrrery';
import Gui from 'gui/Gui';

const debugPos = false;

export default function GeoPos(body3d, target) {

	//home sweet home
	let lat = 46.8139;
	let lng = -71.2080;
	let lastLat;
	let lastLng;

	let sphere;
	if (debugPos) {
		const mat = new MeshPhongMaterial({ color: 0xffffff, emissive: 0xff9911 });
		const radius = body3d.getPlanetSize() * 0.002;
		const segments = 50;
		const rings = 50;
		sphere = new Mesh(
			new SphereGeometry(radius, segments, rings),
			mat
		);
		body3d.root.add(sphere);
	}

	this.update = () => {
		if (lng === lastLng && lat === lastLat) return;
		console.log(lng, lat);
		lastLat = lat;
		lastLng = lng;
		const parsedLat = Number(lat) * DEG_TO_RAD;
		const parsedLng = (((Number(lng) - 180) * DEG_TO_RAD + body3d.celestial.getCurrentRotation()) % CIRCLE);//0.85 * DEG_TO_RAD + 
		// console.log(parsedLng);
		const a = new Euler(
			parsedLat,
			0,
			parsedLng,
			'ZYX'
		);
		const pos = new Vector3(
			0,
			body3d.getPlanetSize(),
			0
		);	
		pos.applyEuler(a);
		pos.applyEuler(new Euler(-body3d.celestial.tilt * DEG_TO_RAD, 0, 0, 'XYZ'));
		if (sphere) sphere.position.copy(pos.clone().multiplyScalar(1.01));
		target.position.copy(pos);
		getUniverse().requestDraw();

	};

	Gui.addSlider('lat', { min: -90, max: 90, initial: lat }, val => {
		lat = val;
		this.update();
	});
	Gui.addSlider('lng', { min: -180, max: 180, initial: lng }, val => {
		lng = val;
		this.update();
	});
	this.update();

}
