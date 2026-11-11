import { Scene, WebGLRenderer, AmbientLight, ColorManagement, LinearSRGBColorSpace, type Vector3 } from 'three';

import Body3D from './Body3d';
import MilkyWay from './MilkyWayParticles';
import CameraManager from './CameraManager';
import OrbitLinesManager from './lines/OrbitLinesManager';
import TracerManager from './lines/TracerManager';
import * as DebugPoint from './utils/DebugPoint';
import * as Dimensions from './Dimensions';
import Screenshot from './Screenshot';
import Sun, { ExternalSun } from './Sun';
import Labels from '../graphics2d/Labels';
import { IS_CAPTURE, DEG_TO_RAD, KM } from '../core/constants';
import type CelestialBody from '../core/CelestialBody';
import type Universe from '../core/Universe';
import type { CameraSettings, Scenario } from '../scenario/types';

//the renderer is shared by all scenarios
let renderer: WebGLRenderer | undefined;

//jsOrrery was designed with three.js' legacy (pre r152) color pipeline: no sRGB conversions anywhere.
ColorManagement.enabled = false;

function getRenderer() {
	if (!renderer) {
		renderer = new WebGLRenderer({
			antialias: true,
			preserveDrawingBuffer: true,
			alpha: true,
		});
		renderer.outputColorSpace = LinearSRGBColorSpace;
	}
	return renderer;
}

export default class JSOrreryScene {
	width = 0;
	height = 0;
	declare universe: Universe;
	bodies3d: Body3D[] = [];
	bodyScale = 1;
	declare domEl: HTMLDivElement;
	root = new Scene();
	stageSize = 0;
	smallestSMA = 0;
	declare orbitLinesManager: OrbitLinesManager;
	declare tracerManager: TracerManager;
	declare cameraManager: CameraManager;
	declare labels: Labels;
	milkyway?: MilkyWay;
	sun?: Sun | ExternalSun;
	centralBody?: CelestialBody;
	screenshot?: Screenshot;

	createStage(rootDomEl: HTMLElement, scenario: Scenario, universe: Universe, geoloc?: string) {
		this.width = (scenario.sceneSize && scenario.sceneSize.width) || rootDomEl.offsetWidth;
		this.height = (scenario.sceneSize && scenario.sceneSize.height) || rootDomEl.offsetHeight;

		this.universe = universe;
		this.domEl = document.createElement('div');
		this.domEl.id = 'universe';
		this.domEl.style.width = `${this.width}px`;
		this.domEl.style.height = `${this.height}px`;
		rootDomEl.appendChild(this.domEl);

		DebugPoint.setContainer(this.root);

		const renderer = getRenderer();
		if (IS_CAPTURE) this.screenshot = new Screenshot(renderer);

		renderer.setSize(this.width, this.height);
		renderer.setPixelRatio(window.devicePixelRatio);

		//light intensities are multiplied by PI to match three.js' legacy lighting mode (removed in r165)
		const light = new AmbientLight(0x202020, Math.PI);
		this.root.add(light);

		this.domEl.appendChild(renderer.domElement);

		this.orbitLinesManager = new OrbitLinesManager(!!scenario.usePhysics);
		this.tracerManager = new TracerManager(this.root);

		this.cameraManager = new CameraManager({
			scene: this,
			aspect: this.width / this.height,
			fov: scenario.fov,
			stageSize: this.stageSize,
			container: this.domEl,
			universe,
			orbitLinesManager: this.orbitLinesManager,
			tracerManager: this.tracerManager,
			geoloc,
		});
		this.labels = new Labels(this.domEl, this.cameraManager);

		this.setMilkyway();
	}

	setCameraDefaults(settings?: CameraSettings) {
		this.cameraManager.putDefaults(settings);
	}

	setMilkyway() {
		const milkyway = this.milkyway = new MilkyWay(this.stageSize * 6);
		this.root.add(milkyway.getDisplayObject());
	}

	setDimension(largestSMA: number, smallestSMA: number) {
		Dimensions.setLargestDimension(largestSMA);
		this.stageSize = Dimensions.getScaled(largestSMA);
		this.smallestSMA = smallestSMA;
	}

	setSize(width: number, height: number) {
		if (!width || !height || (width === this.width && height === this.height)) return;
		this.width = width;
		this.height = height;
		this.domEl.style.width = `${width}px`;
		this.domEl.style.height = `${height}px`;
		getRenderer().setSize(width, height);
		this.cameraManager.setAspect(width / height);
		if (this.sun) this.sun.setAspectRatio(width / height);
	}

	setPlanetScale(scale: number) {
		this.bodies3d.forEach(body3d => {
			body3d.setScale(scale);
		});
		this.bodyScale = scale;
	}

	draw() {
		this.bodies3d.forEach(b => b.draw());

		//after all bodies have been positionned, update camera matrix (as camera might be attached to a body)
		this.cameraManager.updateCameraMatrix();
		const camPos = this.cameraManager.getCameraPosition();

		this.tracerManager.draw();

		//center the milkyway to the camera position, to make it look infinite
		if (this.milkyway) this.milkyway.setPosition(camPos);

		const cam = this.cameraManager.getCamera();
		if (this.sun) this.sun.draw(cam, camPos);

		getRenderer().render(this.root, cam);
		if (this.screenshot) this.screenshot.capture();

		//place planets labels. We need the camera position relative to the world in order to compute planets screen sizes, and hide/show labels depending on it
		const radFov = cam.fov * DEG_TO_RAD;
		this.labels.draw(camPos, radFov, this.width, this.height);
	}

	//camera might move and/or look at a different point depending on bodies movements
	updateCamera() {
		this.cameraManager.updateCamera();
	}

	getCamera() {
		return this.cameraManager.getCamera();
	}

	//when the date has changed by the user instead of by the playhead, we need to recalculate the orbits and redraw
	onDateReset() {
		this.updateCamera();
		this.orbitLinesManager.resetAllOrbits();
		this.tracerManager.resetTrace();
		this.draw();
	}

	addBody(celestialBody: CelestialBody) {
		const body3d = celestialBody.displayType === 'sun' ? new Sun(celestialBody, this) : new Body3D(celestialBody, this);

		this.labels.addPlanetLabel(celestialBody.title || celestialBody.name, body3d);

		this.bodies3d.push(body3d);
		this.root.add(body3d.getDisplayObject());

		this.orbitLinesManager.addBody(body3d);
		this.tracerManager.addBody(body3d);
		this.cameraManager.addBody(body3d);
	}

	addEventLabel(tx: string, pos: Vector3, relativeTo: CelestialBody) {
		this.labels.addEventLabel(tx, pos, relativeTo);
	}

	getRoot() {
		return this.root;
	}

	getDomEl() {
		return this.domEl;
	}

	getSize() {
		return this.stageSize;
	}

	getAspectRatio() {
		return this.width / this.height;
	}

	setCentralBody(centralBody: CelestialBody) {
		this.centralBody = centralBody;
		//make sure that any celestial body cannot be larger than the central celestial body
		const central3d = centralBody.body3d!;
		//central body's scale is at most x% of the nearest orbit
		central3d.maxScale = (this.smallestSMA / (centralBody.radius * KM)) * 0.2;
		central3d.maxScale = central3d.maxScale < 1 ? 1 : central3d.maxScale;

		const maxDim = central3d.maxScale * centralBody.radius * KM;
		this.bodies3d.forEach(body3d => {
			body3d.maxScale = (maxDim / (body3d.celestial.radius * KM));
		});

		//if central body is not the sun, it means that it is supposed to revolve around the sun, but that the sun os not part of this simulation (because it is not the central body). Therefore, we have to add a sun outside of the simulation.
		if (central3d instanceof Sun) {
			this.sun = central3d;
		} else {
			this.sun = new ExternalSun(centralBody, this.universe, this.getAspectRatio(), this.stageSize);
			this.root.add(this.sun.getDisplayObject());
		}
	}

	kill() {
		this.cameraManager.kill();
		this.orbitLinesManager.kill();
		this.tracerManager.kill();
		this.labels.kill();
		this.domEl.remove();
	}
}
