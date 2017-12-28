/**
	Controls the trace of a body relative to another. Traces are not orbit lines, they are the path trace of a body relative to another
*/

import Tracer from './Tracer';

//number of tracing vertices. It was previously taken directly from the orbit's size, but a constant number is more convenient
const N_VERTICES = 1000;

export default class TracerManager {
	constructor(containerParam) {
		this.bodies3d = [];
		this.container = containerParam;
		this.activeTracers = [];
	}

	setTraceFrom(lookFromBody, lookAtBody) {				
		this.removeTracers();
		this.activeTracers.length = 0;
		this.addTracer(lookAtBody, lookFromBody);
	}

	//when date changes by user action, reset active tracers
	resetTrace() {
		this.removeTracers();
		this.activeTracers.forEach(tracer => {
			tracer.getNew();
			this.container.add(tracer.getDisplayObject());
		});
	}

	addTracer(tracingBody, traceFromBody) {
		if (!tracingBody) return;
		const tracer = tracingBody.tracer;
		if (!tracer) return;
		tracer.setTraceFrom(traceFromBody);
		tracer.getNew();
		this.container.add(tracer.getDisplayObject());
		this.activeTracers.push(tracer);
	}

	removeTracers() {
		const container = this.container;
		
		this.bodies3d.forEach(body3d => {
			if (body3d.celestial.forceTrace) return;
			const tracer = body3d.tracer;
			//clear all traces first
			if (!tracer) return;
			container.remove(tracer.getDisplayObject());
		});
	}

	draw() {
		if (this.deferredForceTraceBody) {
			this.deferredForceTraceBody.forEach(tracingBody => {
				const traceFromBody = tracingBody.getTraceRelativeToBody();
				this.addTracer(tracingBody, traceFromBody && traceFromBody.getBody3D());
			});
			this.deferredForceTraceBody = null;
		}
	}

	addBody(body3d) {

		this.bodies3d.push(body3d);

		if (body3d.celestial.isCentral && !body3d.celestial.forceTrace) return;

		const tracer = new Tracer(body3d.celestial.traceColor || body3d.celestial.color, N_VERTICES, body3d.celestial.name);
		body3d.setTracer(tracer);

		if (body3d.celestial.forceTrace) {
			this.deferredForceTraceBody = this.deferredForceTraceBody || [];
			this.deferredForceTraceBody.push(body3d);
		}
		
	}

	kill() {
	}
};
