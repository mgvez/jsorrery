
import $ from 'jquery';

import { DEG_TO_RAD } from '../constants';
import Dimensions from '../graphics3d/Dimensions';
import CameraManager from '../graphics3d/CameraManager';

const EVENT_LABEL_LINE_H = 100;
const EVENT_LABEL_MAX_ANGLE = 45;

let labels;
let sceneW;
let sceneH;
let halfSceneW;

//project scene position to 2d screen coordinates. Returns null if position is out of screen.
function toScreenCoords(pos, camPos, fov) {
	const cam = CameraManager.getCamera();
	const vector = pos.clone().project(cam);
	vector.x = (vector.x + 1) / 2 * sceneW;
	vector.y = -(vector.y - 1) / 2 * sceneH;
	if (vector.z < 1 && vector.x > 0 && vector.x < sceneW && vector.y > 0 && vector.y < sceneH) {
		const dst = camPos.distanceTo(pos);
		const span = Math.atan(fov / 2) * dst;
		const factor = 1 / (1 + Math.log10(span));
		vector.z = 0.3 + factor;
		return vector;
	}
	return null;
}

//map callback, executed at each frame for each label.
function positionLabel(label) {
	label.callback(this.camPos, this.fov);
}

//planet label specific positioning callback
function getPlanetLabelCallback(el, body3d) {
	let screenCoords;

	return (camPos, fov) => {
		screenCoords = toScreenCoords(body3d.getPosition(), camPos, fov);
		// console.log(camPos.x, body3d.getPosition().x, body3d.celestial.name);
		if (screenCoords) {
			const alpha = 1 / screenCoords.z; 
			el.css({ transform: `translate(${screenCoords.x}px, ${screenCoords.y}px) scale(${screenCoords.z})`, opacity: alpha }).show();
		} else {
			el.hide();
		}
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
	return (camPos) => {
		screenCoords = toScreenCoords(
			Dimensions.getScaled(pos.clone().add(relativeTo.getPosition())),
			camPos
		);
		if (screenCoords && halfSceneW) {
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
	},

	addPlanetLabel(title, body3d) {
		const el = $(`<div class="planetSpot" data-shown="true"><div class="planetLabel">${title}</div></div>`).appendTo('body');
		
		labels.push({
			el,
			callback: getPlanetLabelCallback(el, body3d),
		});
	},

	addEventLabel(tx, pos, relativeTo) {
		const el = $(`<div class="eventLabel"><div class="line"></div><div class="tx">${tx}</div></div>`).appendTo('body');
		labels.push({
			el,
			callback: getEventLabelCallback(el, pos, relativeTo),
		});
	},

	draw(camPos, fov, w, h) {
		// currentCamera.getWorldPosition();
		if (w !== sceneW || h !== sceneH) {
			sceneW = w;
			sceneH = h;
			halfSceneW = sceneW / 2;
		}
		labels.map(positionLabel, { camPos, fov });
	},

	kill() {
		if (!labels) return;
		labels.forEach(label => {
			label.el.remove();
		});
		labels = null;
	},
};
