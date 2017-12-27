
import $ from 'jquery';

import { DEG_TO_RAD } from '../core/constants';
import Dimensions from '../graphics3d/Dimensions';

const EVENT_LABEL_LINE_H = 100;
const EVENT_LABEL_MAX_ANGLE = 45;


//map callback, executed at each frame for each label.
function positionLabel(label) {
	label.callback(this.camPos, this.fov);
}



export default class Labels {
	constructor(rootDomEl, cameraManager) {
		this.rootDomEl = rootDomEl;
		this.cameraManager = cameraManager;
		this.labels = [];
	}

	//project scene position to 2d screen coordinates. Returns null if position is out of screen.
	toScreenCoords(pos, camPos, fov) {
		const cam = this.cameraManager.getCamera();
		const vector = pos.clone().project(cam);
		vector.x = (vector.x + 1) / 2 * this.sceneW;
		vector.y = -(vector.y - 1) / 2 * this.sceneH;
		if (vector.z < 1 && vector.x > 0 && vector.x < this.sceneW && vector.y > 0 && vector.y < this.sceneH) {
			const dst = camPos.distanceTo(pos);
			const span = Math.atan(fov / 2) * dst;
			const factor = 1 / (1 + Math.log10(span));
			vector.z = 0.3 + factor;
			return vector;
		}
		return null;
	}

	//planet label specific positioning callback
	getPlanetLabelCallback(el, body3d) {
		let screenCoords;

		return (camPos, fov) => {
			screenCoords = this.toScreenCoords(body3d.getPosition(), camPos, fov);
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
	getEventLabelCallback(el, pos, relativeTo) {
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
			screenCoords = this.toScreenCoords(
				Dimensions.getScaled(pos.clone().add(relativeTo.getPosition())),
				camPos
			);
			if (screenCoords && this.halfSceneW) {
				angle = ((screenCoords.x - this.halfSceneW) / this.halfSceneW) * EVENT_LABEL_MAX_ANGLE;
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

	addPlanetLabel(title, body3d, domContainer) {
		const el = $(`<div class="planetSpot" data-shown="true"><div class="planetLabel">${title}</div></div>`).appendTo(this.rootDomEl);
		
		this.labels.push({
			el,
			callback: this.getPlanetLabelCallback(el, body3d),
		});
	}

	addEventLabel(tx, pos, relativeTo) {
		const el = $(`<div class="eventLabel"><div class="line"></div><div class="tx">${tx}</div></div>`).appendTo(this.rootDomEl);
		this.labels.push({
			el,
			callback: this.getEventLabelCallback(el, pos, relativeTo),
		});
	}

	draw(camPos, fov, w, h) {
		// currentCamera.getWorldPosition();
		if (w !== this.sceneW || h !== this.sceneH) {
			this.sceneW = w;
			this.sceneH = h;
			this.halfSceneW = w / 2;
		}
		this.labels.map(positionLabel, { camPos, fov });
	}

	kill() {
		if (!this.labels) return;
		this.labels.forEach(label => {
			label.el.remove();
		});
		this.labels = null;
	}
};
