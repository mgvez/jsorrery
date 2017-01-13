/**
	
	@author : Kevin M. Gill http://planetmaker.wthr.us/

*/

import { Geometry, Sphere, Vector3, Vector2, Face3 } from 'three';

/** A modification of the standard three.js RingGeometry class, but with changes to support 
 * Celestia-like ring textures.
 */
function RingGeometry2(innerRadius, outerRadius, thetaSegmentsP, phiSegmentsP, thetaStart = 0, thetaLength = Math.PI * 2) {
	Geometry.call(this);

	const thetaSegments = thetaSegmentsP !== undefined ? Math.max(3, thetaSegmentsP) : 8;
	const phiSegments = phiSegmentsP !== undefined ? Math.max(3, phiSegmentsP) : 8;
	
	let i;
	let o;
	const uvs = [];
	let radius = innerRadius || 0;
	const radiusStep = (((outerRadius || 50) - radius) / phiSegments);
	

	for (i = 0; i <= phiSegments; i++) { //concentric circles inside ring

		for (o = 0; o <= thetaSegments; o++) { //number of segments per circle

			const vertex = new Vector3();
			
			vertex.x = radius * Math.cos(thetaStart + o / thetaSegments * thetaLength);
			vertex.y = -radius * Math.sin(thetaStart + o / thetaSegments * thetaLength);
			
			this.vertices.push(vertex);
			uvs.push(new Vector2((i / phiSegments), (vertex.y / radius + 1) / 2));
		}
		
		radius += radiusStep;

	}
	
	
	const n = new Vector3(0, 0, 1);
	
	for (i = 0; i < phiSegments; i++) { //concentric circles inside ring

		for (o = 0; o <= thetaSegments; o++) { //number of segments per circle
			
			let v1;
			let v2;
			let v3;

			v1 = o + (thetaSegments * i) + i;
			v2 = o + (thetaSegments * i) + thetaSegments + i;
			v3 = o + (thetaSegments * i) + thetaSegments + 1 + i;

			this.faces.push(new Face3(v1, v2, v3, [n, n, n]));
			this.faceVertexUvs[0].push([uvs[v1], uvs[v2], uvs[v3]]);
			
			v1 = o + (thetaSegments * i) + i;
			v2 = o + (thetaSegments * i) + thetaSegments + 1 + i;
			v3 = o + (thetaSegments * i) + 1 + i;
			
			this.faces.push(new Face3(v1, v2, v3, [n, n, n]));
			this.faceVertexUvs[0].push([uvs[v1], uvs[v2], uvs[v3]]);

		}
	}
	
	this.computeFaceNormals();

	this.boundingSphere = new Sphere(new Vector3(), radius); 

}

RingGeometry2.prototype = Object.create(Geometry.prototype);

export default RingGeometry2;
