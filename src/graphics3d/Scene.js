

import $ from 'jquery';
import { Scene, WebGLRenderer, AmbientLight } from 'three';
import { Stats } from '../utils/ThreeExamples';// eslint-disable-line

import Body3D from './Body3d';
import MilkyWay from './MilkyWayParticles';
import CameraManager from './CameraManager';
import OrbitLinesManager from './lines/OrbitLinesManager';
import TracerManager from './lines/TracerManager';
import DebugPoint from './utils/DebugPoint';
import Dimensions from './Dimensions';
import Screenshot from './Screenshot';
import { ExternalSun } from './Sun';
import Labels from '../graphics2d/Labels';
import Gui, { PLANET_SCALE_ID } from '../gui/Gui';
import { IS_CAPTURE, DEG_TO_RAD, KM } from '../constants';
		
let stats;
let renderer;

function drawBody(b) {
	b.draw();
}

export default {
	createStage(scenario, universe) {

		this.universe = universe;
		this.bodies3d = [];
		this.bodyScale = 1;
		this.container = $(`<div id="universe" width="${this.width}" height="${this.height}">`).appendTo('body');
		this.root = new Scene();

		DebugPoint.setContainer(this.root);

		renderer = renderer || new WebGLRenderer({
			antialias: true,
			preserveDrawingBuffer: true,
			alpha: true,
		});

		if (IS_CAPTURE) this.screenshot = Object.create(Screenshot).init(renderer);

		//renderer.shadowMapEnabled = true;
		renderer.setSize(this.width, this.height);
		renderer.setPixelRatio(window.devicePixelRatio);

		const light = new AmbientLight(0x202020);
		this.root.add(light);/**/

		if (!stats) {
			// stats = new Stats();
			// const st = stats.domElement.style;
			// st.top = 'auto';
			// st.bottom = 0;
			// $('body').append(stats.domElement);
		}

		this.container.append(renderer.domElement);
		
		//planet scale
		Gui.addSlider(PLANET_SCALE_ID, { min: 1, max: 100, initial: (scenario.forcedGuiSettings && scenario.forcedGuiSettings.scale) || 10 }, val => {
			this.bodies3d.forEach(body3d => {
				body3d.setScale(val);
			});
			this.bodyScale = val;
			this.draw();
		});

		//this.drawAxis();
		CameraManager.init(this, this.width / this.height, scenario.fov, this.stageSize, this.container, universe);
		OrbitLinesManager.init(scenario.calculateAll);
		TracerManager.init(this.root);

		this.setMilkyway();

	},

	setCameraDefaults(settings) {
		CameraManager.putDefaults(settings);
	},

	setMilkyway() {
		const milkyway = this.milkyway = Object.create(MilkyWay);
		milkyway.init(this.stageSize * 6);
		this.root.add(milkyway.getDisplayObject());
	},

	/*
	drawAxis(){
		var object = new THREE.AxisHelper(this.stageSize/10);
		object.position.x = 0;//r
		object.position.y = 0;//g
		object.position.z = 0;//b
		this.root.add( object );
	},/**/

	setDimension(largestSMA, smallestSMA, sceneSize) {
		this.width = (sceneSize && sceneSize.width) || window.innerWidth;
		this.height = (sceneSize && sceneSize.height) || window.innerHeight;
		Dimensions.setLargestDimension(largestSMA);
		this.stageSize = Dimensions.getScaled(largestSMA);
		this.smallestSMA = smallestSMA;
	},

	draw() {
		// console.log('draw');
		this.bodies3d.forEach(drawBody);

		//after all bodies have been positionned, update camera matrix (as camera might be attached to a body)
		CameraManager.updateCameraMatrix();
		const camPos = CameraManager.getCameraPosition();

		TracerManager.draw(camPos);

		//center the milkyway to the camera position, to make it look infinite
		if (this.milkyway) this.milkyway.setPosition(camPos);

		if (this.sun) this.sun.draw(camPos);

		renderer.render(this.root, CameraManager.getCamera());
		if (this.screenshot) this.screenshot.capture();

		//place planets labels. We need the camera position relative to the world in order to compute planets screen sizes, and hide/show labels depending on it
		const radFov = CameraManager.getCamera().fov * DEG_TO_RAD;
		// camPos = CameraManager.getCamera().position.clone();
		// camPos.applyMatrix4(CameraManager.getCamera().matrixWorld);
		Labels.draw(camPos, radFov, this.width, this.height);

		/**/
		if (stats) stats.update();
	},

	//camera might move and/or look at a different point depending on bodies movements
	updateCamera() {
		CameraManager.updateCamera();
	},

	getCamera() {
		return CameraManager.getCamera();
	},

	//when the date has changed by the user instead of by the playhead, we need to recalculate the orbits and redraw
	onDateReset() {
		this.updateCamera();
		OrbitLinesManager.resetAllOrbits();
		TracerManager.resetTrace();
		this.draw();
	},


	addBody(celestialBody) {

		let body3d;
		if (celestialBody.createCustomDisplayObject) {
			body3d = celestialBody.createCustomDisplayObject();
		} else {
			body3d = new Body3D(celestialBody);		
		}

		this.bodies3d.push(body3d);
		this.root.add(body3d.getDisplayObject());

		OrbitLinesManager.addBody(body3d);
		TracerManager.addBody(body3d);
		CameraManager.addBody(body3d);		
	},

	getRoot() {
		return this.root;
	},

	getSize() {
		return this.stageSize;
	},

	getAspectRatio() {
		return this.width / this.height;
	},

	setCentralBody(centralBody) {
		this.centralBody = centralBody;
		//make sure that any celestial body cannot be larger than the central celestial body
		const central3d = centralBody.getBody3D();
		//central body's scale is at most x% of the nearest orbit
		central3d.maxScale = (this.smallestSMA / (centralBody.radius * KM)) * 0.2;
		central3d.maxScale = central3d.maxScale < 1 ? 1 : central3d.maxScale;

		const maxDim = central3d.maxScale * centralBody.radius * KM;
		let maxScaleVal = 0;
		this.bodies3d.forEach(body3d => {
			body3d.maxScale = (maxDim / (body3d.celestial.radius * KM));
			maxScaleVal = maxScaleVal > body3d.maxScale ? maxScaleVal : body3d.maxScale;
		});

		//if central body is not the sun, it means that it is supposed to revolve around the sun, but that the sun os not part of this simulation (because it is not the central body). Therefore, we have to add a sun outside of the simulation.
		if (this.centralBody.name === 'sun') {
			this.sun = central3d;
		} else {
			this.sun = new ExternalSun(centralBody, this.universe);
			this.root.add(this.sun.getDisplayObject());
		}
	

	},

	kill() {
		CameraManager.kill();
		OrbitLinesManager.kill();
		TracerManager.kill();
		this.container.remove();
	},

};
