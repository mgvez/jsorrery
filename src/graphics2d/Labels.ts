import type { Vector3 } from 'three';
import { DEG_TO_RAD } from '../core/constants';
import * as Dimensions from '../graphics3d/Dimensions';
import type CameraManager from '../graphics3d/CameraManager';
import type Body3D from '../graphics3d/Body3d';
import type CelestialBody from '../core/CelestialBody';

const EVENT_LABEL_LINE_H = 100;
const EVENT_LABEL_MAX_ANGLE = 45;

type LabelCallback = (camPos: Vector3, fov: number) => void;

interface Label {
	el: HTMLElement;
	callback: LabelCallback;
}

function createElement(className: string, parent?: HTMLElement) {
	const el = document.createElement('div');
	el.className = className;
	if (parent) parent.appendChild(el);
	return el;
}

/** sets a label's text; "<br>" in the text are rendered as line breaks, everything else as text */
function setLabelText(el: HTMLElement, text: string) {
	text.split(/<br\s*\/?>/i).forEach((line, idx) => {
		if (idx) el.appendChild(document.createElement('br'));
		el.appendChild(document.createTextNode(line));
	});
}

/**
 2d labels positionned over the 3d scene: one for each planet, and labels for events that occured in a scenario.
 They are positionned at each frame, so they are managed outside of React.
 */
export default class Labels {
	rootDomEl: HTMLElement;
	cameraManager: CameraManager;
	labels: Label[] = [];
	sceneW = 0;
	sceneH = 0;
	halfSceneW = 0;

	constructor(rootDomEl: HTMLElement, cameraManager: CameraManager) {
		this.rootDomEl = rootDomEl;
		this.cameraManager = cameraManager;
	}

	//project scene position to 2d screen coordinates. Returns null if position is out of screen.
	toScreenCoords(pos: Vector3, camPos: Vector3, fov?: number) {
		const cam = this.cameraManager.getCamera();
		const vector = pos.clone().project(cam);
		vector.x = (vector.x + 1) / 2 * this.sceneW;
		vector.y = -(vector.y - 1) / 2 * this.sceneH;
		if (vector.z < 1 && vector.x > 0 && vector.x < this.sceneW && vector.y > 0 && vector.y < this.sceneH) {
			const dst = camPos.distanceTo(pos);
			const span = Math.atan(fov! / 2) * dst;
			const factor = 1 / (1 + Math.log10(span));
			vector.z = 0.3 + factor;
			return vector;
		}
		return null;
	}

	//planet label specific positioning callback
	getPlanetLabelCallback(el: HTMLElement, body3d: Body3D): LabelCallback {
		return (camPos, fov) => {
			const screenCoords = this.toScreenCoords(body3d.getPosition(), camPos, fov);
			if (screenCoords) {
				const alpha = 1 / screenCoords.z;
				el.style.transform = `translate(${screenCoords.x}px, ${screenCoords.y}px) scale(${screenCoords.z})`;
				el.style.opacity = String(alpha);
				el.style.display = '';
			} else {
				el.style.display = 'none';
			}
		};
	}

	//event label specific positioning callback
	getEventLabelCallback(el: HTMLElement, pos: Vector3, relativeTo: CelestialBody): LabelCallback {
		const line = el.querySelector<HTMLElement>('.line')!;
		const tx = el.querySelector<HTMLElement>('.tx')!;
		const txHalfW = tx.offsetWidth / 2;
		const txH = tx.offsetHeight;
		return (camPos) => {
			const screenCoords = this.toScreenCoords(
				Dimensions.getScaled(pos.clone().add(relativeTo.getPosition())),
				camPos
			);
			if (screenCoords && this.halfSceneW) {
				const angle = ((screenCoords.x - this.halfSceneW) / this.halfSceneW) * EVENT_LABEL_MAX_ANGLE;
				const radAngle = angle * DEG_TO_RAD;
				const tipPos = { x: Math.sin(radAngle) * EVENT_LABEL_LINE_H, y: -Math.cos(radAngle) * EVENT_LABEL_LINE_H };

				line.style.transform = `rotate(${angle}deg)`;
				line.style.left = `${tipPos.x}px`;
				line.style.top = `${tipPos.y}px`;
				tx.style.left = `${tipPos.x - txHalfW}px`;
				tx.style.top = `${tipPos.y - txH}px`;
				el.style.left = `${screenCoords.x}px`;
				el.style.top = `${screenCoords.y}px`;
				el.style.display = '';
			} else {
				el.style.display = 'none';
			}
		};
	}

	addPlanetLabel(title: string, body3d: Body3D) {
		const el = createElement('planetSpot', this.rootDomEl);
		el.dataset.shown = 'true';
		const label = createElement('planetLabel', el);
		label.textContent = title;

		this.labels.push({
			el,
			callback: this.getPlanetLabelCallback(el, body3d),
		});
	}

	addEventLabel(text: string, pos: Vector3, relativeTo: CelestialBody) {
		const el = createElement('eventLabel', this.rootDomEl);
		createElement('line', el);
		setLabelText(createElement('tx', el), text);
		this.labels.push({
			el,
			callback: this.getEventLabelCallback(el, pos, relativeTo),
		});
	}

	draw(camPos: Vector3, fov: number, w: number, h: number) {
		if (w !== this.sceneW || h !== this.sceneH) {
			this.sceneW = w;
			this.sceneH = h;
			this.halfSceneW = w / 2;
		}
		this.labels.forEach(label => label.callback(camPos, fov));
	}

	kill() {
		this.labels.forEach(label => {
			label.el.remove();
		});
		this.labels = [];
	}
}
