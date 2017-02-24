
import { TweenMax } from 'gsap';
import { Vector3, Texture, Sprite, SpriteMaterial, OrthographicCamera, Scene } from 'three'
;
import $ from 'jquery';

import { DEG_TO_RAD } from '../constants';
import Dimensions from '../graphics3d/Dimensions';
import CameraManager from '../graphics3d/CameraManager';

const BASE_SIZE = 40;

const EVENT_LABEL_LINE_H = 100;
const EVENT_LABEL_MAX_ANGLE = 45;

let labels;
let sceneW;
let sceneH;
let halfSceneW;

function createLabel(tx) {

	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	canvas.width = 1024;
	canvas.height = 64;
	context.font = `${BASE_SIZE}px Sans-serif`;	
	context.fillStyle = 'rgba(255, 255, 255, 1.0)';
	const dim = context.measureText(tx);
	// console.log(dim);
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;

	const radius = 30;
	context.fillText(tx, centerX - (dim.width + radius * 1.2), BASE_SIZE);

	context.beginPath();
	context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	context.lineWidth = 2;
	context.strokeStyle = 'rgba(100, 100, 100, 1)';
	context.stroke();

	const texture = new Texture(canvas);
	texture.needsUpdate = true;

	const spriteMaterial = new SpriteMaterial({ map: texture });
	const sprite = new Sprite(spriteMaterial);
	// const scale = Dimensions.getScaled(new Vector3(1024 * 1000, 64 * 1000, 1));
	sprite.scale.set(canvas.width / 4, canvas.height / 4, 1);
	// console.log(scale);
	sprite.position.set(1, 1, 1);
	return sprite;	
}


//project scene position to 2d screen coordinates. Returns null if position is out of screen.
function toScreenCoords(pos) {
	const vector = pos.project(CameraManager.getCamera());
	vector.x = Math.round(vector.x * (sceneW / 2));
	vector.y = Math.round(vector.y * (sceneH / 2));
	return vector;
}

//map callback, executed at each frame for each label.
function positionLabel(label) {
	if (label.callback) label.callback(this.camPos);
}

//planet label specific positioning callback
function getPlanetLabelCallback(el, body3d) {

	return (camPos) => {
		const screenCoords = toScreenCoords(body3d.getPosition());
		if (screenCoords) {
			el.position.set(screenCoords.x, screenCoords.y, 1);
			// console.log(screenCoords.z);
			let scale = (1 - screenCoords.z) * 100000;
			if (scale > 1) scale = 1;
			if (scale < 0.1) scale = 0.1;
			// console.log(scale);
			el.scale.set(1024 * 0.25 * scale, 64 * 0.25 * scale, 1);
		}
		// const pos = body3d.getPosition();
		// el.position.set(pos);
	};
}

//event label specific positioning callback
function getEventLabelCallback(el, pos, relativeTo) {
	const line = el.find('.line');
	const tx = el.find('.tx');
	const txHalfW = tx.outerWidth() / 2;
	const txH = tx.outerHeight();
	let screenCoords;
	let angle;
	let radAngle;
	let tipPos;
	let cssRot;
	return () => {
		screenCoords = toScreenCoords(
			Dimensions.getScaled(pos.clone().add(relativeTo.getPosition()))
		);
		if (screenCoords) {
			angle = ((screenCoords.x - halfSceneW) / halfSceneW) * EVENT_LABEL_MAX_ANGLE;
			radAngle = angle * DEG_TO_RAD;
			tipPos = { x: Math.sin(radAngle) * EVENT_LABEL_LINE_H, y: -Math.cos(radAngle) * EVENT_LABEL_LINE_H };
			cssRot = `rotate(${angle}deg)`;

			line.css({ WebkitTransform: cssRot, '-moz-transform': cssRot, left: tipPos.x, top: tipPos.y });
			tx.css({ left: tipPos.x - txHalfW, top: tipPos.y - txH });
			el.css({ left: screenCoords.x + 'px', top: screenCoords.y + 'px' }).show();
		} else {
			el.hide();
		}
	};
}


export default {
	init() {
		if (labels) this.kill();
		labels = [];
		sceneW = $(window).width();
		sceneH = $(window).height();
		halfSceneW = sceneW / 2;

		this.camera = new OrthographicCamera(-sceneW / 2, sceneW / 2, sceneH / 2, -sceneH / 2, 1, 10);
		this.camera.position.z = 10;
		this.scene = new Scene();
	},

	addPlanetLabel(title, body3d) {
		const el = createLabel(title);
		this.scene.add(el);
		labels.push({
			el,
			callback: getPlanetLabelCallback(el, body3d),
		});
	},

	addEventLabel(tx, pos, relativeTo) {
		const el = createLabel(tx);

		labels.push({
			el,
			// callback: getEventLabelCallback(el, pos, relativeTo),
		});
	},

	draw(camPos, lookAt) {
		// this.camera.position.set(camPos);
		// this.camera.lookAt(lookAt);
		this.camera.updateProjectionMatrix();
		labels.map(positionLabel, { camPos });
	},

	kill() {
		labels = null;
	},
};
