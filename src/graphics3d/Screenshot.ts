import type { WebGLRenderer } from 'three';

/**
 Development tool: posts a capture of the canvas every n frames to a local script (see IS_CAPTURE in constants),
 to make videos of the simulation.
 */
export default class Screenshot {
	i = 0;
	renderer: WebGLRenderer;
	interval: number;

	constructor(renderer: WebGLRenderer, interval = 5) {
		this.renderer = renderer;
		this.interval = interval;
	}

	capture() {
		if (this.i % this.interval === 0) {
			const body = new URLSearchParams({
				im: this.renderer.domElement.toDataURL(),
				i: String(this.i),
			});
			fetch('/_workdir/save.php', { method: 'POST', body }).catch((e) => {
				console.log(e);
			});
		}
		this.i++;
	}
}
