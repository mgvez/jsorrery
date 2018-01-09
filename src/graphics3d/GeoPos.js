import { Vector3, Euler, Mesh, SphereGeometry, MeshPhongMaterial } from 'three';
import { DEG_TO_RAD, CIRCLE } from '../core/constants';
import { getJ2000SecondsFromJD } from '../utils/JD';

const debugPos = true;

export default function GeoPos(body3d, target, gui) {
	this.gui = gui;
	//home sweet home
	let lat = 46.8139;
	let lng = -71.2080;
	let lastLat;
	let lastLng;
	let lastTime;

	const universe = body3d.celestial.universe;

	let sphere;
	if (debugPos) {
		const mat = new MeshPhongMaterial({ color: 0xffffff, emissive: 0xff9911 });
		const radius = body3d.getPlanetSize() * 0.008;
		const segments = 50;
		const rings = 50;
		sphere = new Mesh(
			new SphereGeometry(radius, segments, rings),
			mat
		);
		body3d.root.add(sphere);
	}

	this.update = () => {
		const time = getJ2000SecondsFromJD(body3d.celestial.currentJD);
		if (lng === lastLng && lat === lastLat && time === lastTime) return;
		// console.log(lng, lat);
		lastLat = lat;
		lastLng = lng;
		lastTime = time;
		const parsedLat = Number(lat) * DEG_TO_RAD;
		const parsedLng = (((Number(lng) - 180) * DEG_TO_RAD + body3d.celestial.getCurrentRotation()) % CIRCLE);
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
		pos.applyEuler(body3d.celestial.getTilt());
		if (sphere) sphere.position.copy(pos.clone().multiplyScalar(1.01));
		target.position.copy(pos);
		universe.requestDraw();
	};

	this.activate = () => {
		this.gui.addGeoloc({ lat, lng }, val => {
			lat = val.lat;
			lng = val.lng;
			this.update();
		});
		this.update();
	};

	this.deactivate = () => {
		this.gui.removeGeoloc();
	};

}
