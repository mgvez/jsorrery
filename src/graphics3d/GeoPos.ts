import { Vector3, Euler, Mesh, SphereGeometry, MeshPhongMaterial, type Camera } from 'three';
import { DEG_TO_RAD, CIRCLE } from '../core/constants';
import { getJ2000SecondsFromJD } from '../utils/JD';
import GeoCoord, { type GeoLoc } from '../utils/GeoCoord';
import type Body3D from './Body3d';
import type Universe from '../core/Universe';

const debugPos = true;

//home sweet home
const DEFAULT_LOC: GeoLoc = { lat: 46.8139, lng: -71.2080 };

/**
 Places a camera on the surface of a body, at a given latitude / longitude
 */
export default class GeoPos {
	body3d: Body3D;
	target: Camera;
	universe: Universe;
	lat: number;
	lng: number;
	lastLat?: number;
	lastLng?: number;
	lastTime?: number;
	sphere?: Mesh;

	/** @param initialLoc location as entered in the GUI or the query string, e.g. "46.8139, -71.2080" */
	constructor(body3d: Body3D, target: Camera, universe: Universe, initialLoc?: string) {
		this.body3d = body3d;
		this.target = target;
		this.universe = universe;
		const loc = initialLoc ? new GeoCoord().setFromString(initialLoc) : DEFAULT_LOC;
		this.lat = loc.lat;
		this.lng = loc.lng;

		if (debugPos) {
			const mat = new MeshPhongMaterial({ color: 0xffffff, emissive: 0xff9911 });
			const radius = body3d.getPlanetSize() * 0.008;
			const segments = 50;
			const rings = 50;
			this.sphere = new Mesh(
				new SphereGeometry(radius, segments, rings),
				mat
			);
			body3d.root.add(this.sphere);
		}
	}

	update() {
		const { body3d, lat, lng } = this;
		const time = getJ2000SecondsFromJD(body3d.celestial.currentJD);
		if (lng === this.lastLng && lat === this.lastLat && time === this.lastTime) return;
		this.lastLat = lat;
		this.lastLng = lng;
		this.lastTime = time;
		const parsedLat = Number(lat) * DEG_TO_RAD;
		const parsedLng = (((Number(lng) - 180) * DEG_TO_RAD + body3d.celestial.getCurrentRotation()) % CIRCLE);
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
		if (this.sphere) this.sphere.position.copy(pos.clone().multiplyScalar(1.01));
		this.target.position.copy(pos);
		this.universe.requestDraw();
	}

	setLoc(loc: GeoLoc) {
		this.lat = loc.lat;
		this.lng = loc.lng;
		this.universe.onGeolocChange({ lat: this.lat, lng: this.lng });
		this.update();
	}

	activate() {
		this.universe.onGeolocChange({ lat: this.lat, lng: this.lng });
		this.update();
	}

	deactivate() {
		this.universe.onGeolocChange(null);
	}
}
