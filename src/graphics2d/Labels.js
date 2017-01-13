
import { TweenMax } from 'gsap';
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
function toScreenCoords(pos) {
	const vector = pos.project(CameraManager.getCamera());
	vector.x = Math.round((vector.x + 1) / 2 * sceneW);
	vector.y = Math.round(-(vector.y - 1) / 2 * sceneH);/**/

	if (vector.z < 1 && vector.z > 0 && vector.x > 0 && vector.x < sceneW && vector.y > 0 && vector.y < sceneH) {
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
	let dist;
	let visibleHeight;
	let isVisible;

	return (camPos, fov) => {
		screenCoords = toScreenCoords(body3d.getPosition());
		if (screenCoords) {
			el.css({ left: screenCoords.x + 'px', top: screenCoords.y + 'px' }).show();

			dist = body3d.root.position.distanceTo(camPos);
			visibleHeight = 2 * Math.tan(fov / 2) * dist;
			//if planet is larger than 10% of screen height, hide label
			isVisible = (body3d.getPlanetStageSize() / visibleHeight) < 0.1;
			if (isVisible !== el.data('shown')) {
				el.data('shown', isVisible);
				TweenMax.killTweensOf(el);
				TweenMax.to(el, 1, { css: { opacity: isVisible ? 1 : 0 } });
			}

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

	draw(camPos, fov) {
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
