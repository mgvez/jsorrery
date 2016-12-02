

import $ from 'jquery';
import { Scene, WebGLRenderer, AmbientLight, Stats } from 'three';

import Body3D from './Body3d';
import MilkyWay from './MilkyWayParticles';
import Sun from './Sun';
import Universe from '../Universe';
import CameraManager from './CameraManager';
import OrbitLinesManager from './OrbitLinesManager';
import TracerManager from './TracerManager';
import Dimensions from './Dimensions';
import Screenshot from './Screenshot';
import Labels from '../graphics2d/Labels';
import Gui, { PLANET_SCALE_ID } from '../gui/Gui';
import { is_capture, DEG_TO_RAD, KM } from '../constants';

// 'vendor/jquery.mousewheel',
// 		'three/stats',
		
let stats;
let renderer;

function drawBody(b) {
	b.drawMove();
}

export default {
	createStage(scenario) {

		this.bodies3d = [];

		this.container = $(`<div id="universe" width="${this.width}" height="${this.height}">`).appendTo('body');
		this.root = new Scene();				

		renderer = renderer || new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });

		if (is_capture) this.screenshot = Object.create(Screenshot).init(renderer);

		//renderer.shadowMapEnabled = true;
		renderer.setSize(this.width, this.height);

		const light = new AmbientLight(0x202020);
		this.root.add(light);/**/

		if (!stats) {
			stats = new Stats();
			$('body').append(stats.domElement);
		}

		this.container.append(renderer.domElement);
		
		//planet scale
		Gui.addSlider(PLANET_SCALE_ID, null, val => {
			this.bodies3d.forEach(body3d => {
				body3d.setScale(val);
			});
			this.draw();
		});

		//this.drawAxis();
		CameraManager.init(this, this.width / this.height, scenario.fov, this.stageSize, this.container);
		OrbitLinesManager.init(this.root);
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


	setSun() {

		const sun = this.sun = Object.create(Sun);
		sun.init();
		const hasCelestial = this.centralBody && this.centralBody.name === 'sun';
		sun.setLight(hasCelestial);
			
		this.root.add(sun.getDisplayObject());

	},

	/*
	drawAxis(){
		var object = new THREE.AxisHelper(this.stageSize/10);
		object.position.x = 0;//r
		object.position.y = 0;//g
		object.position.z = 0;//b
		this.root.add( object );
	},/**/

	setDimension(largestSMA, smallestSMA, largestRadius) {
		this.width = $(window).width();
		this.height = $(window).height();
		Dimensions.setLargestDimension(largestSMA);
		this.stageSize = Dimensions.getScaled(largestSMA);
		this.smallestSMA = smallestSMA;
	},

	draw() {
		
		this.bodies3d.forEach(drawBody);
		//after all bodies have been positionned, update camera matrix (as camera might be attached to a body)
		CameraManager.updateCameraMatrix();
		let camPos = (CameraManager.getCamera().getAbsolutePos && CameraManager.getCamera().getAbsolutePos()) || CameraManager.getCamera().position;

		//move sun, if its not a body shown. This assumes that the central body, if it has an orbit, revolves around the sun
		if (this.sun && this.centralBody && this.centralBody.orbit) {
			const pos = this.centralBody.calculatePosition(Universe.currentTime);
			pos.setLength(this.stageSize * 4).negate();
			this.sun.setPosition(pos);
		} else if (this.sun) {
			const sunPos = this.centralBody.getBody3D().getPosition();
			this.sun.setPosition(sunPos);/**/
			this.sun.setFlarePosition(camPos.clone().sub(sunPos).multiplyScalar(0.2));/**/
			this.sun.setFlareSize(this.centralBody.getBody3D().getScreenSizeRatio(camPos, CameraManager.getCamera().fov), this.height);/**/
		}

		TracerManager.draw();

		//center the milkyway to the camera position, to make it look infinite
		if (this.milkyway) this.milkyway.setPosition(camPos);

		renderer.render(this.root, CameraManager.getCamera());
		if (this.screenshot) this.screenshot.capture();

		//place planets labels. We need the camera position relative to the world in order to compute planets screen sizes, and hide/show labels depending on it
		const radFov = CameraManager.getCamera().fov * DEG_TO_RAD;
		camPos = CameraManager.getCamera().position.clone();
		camPos.applyMatrix4(CameraManager.getCamera().matrixWorld);
		Labels.draw(camPos, radFov);
		/**/
		stats.update();
	},

	//camera might move and/or look at a different point depending on bodies movements
	updateCamera() {
		CameraManager.updateCamera();
	},

	//when the date has changed by the user instead of by the playhead, we need to recalculate the orbits and redraw
	onDateReset() {
		this.updateCamera();
		OrbitLinesManager.resetAllOrbits();
		TracerManager.resetTrace();
		this.draw();
	},

	addBody(celestialBody) {
		const body3d = Object.create(Body3D);
		// console.log(celestialBody);
		body3d.init(celestialBody);
		this.bodies3d.push(body3d);
		body3d.setParentDisplayObject(this.root);
		
		CameraManager.addBody(body3d);
		OrbitLinesManager.addBody(body3d);
		TracerManager.addBody(body3d);
	},

	getRoot() {
		return this.root;
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
		//console.log(maxScaleVal);
		this.setSun();
	},

	kill() {
		CameraManager.kill();
		OrbitLinesManager.kill();
		TracerManager.kill();
		Gui.remove(PLANET_SCALE_ID);
		this.container.remove();
	},

};
