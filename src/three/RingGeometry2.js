/**

	@author : Kevin M. Gill http://planetmaker.wthr.us/

*/

import { BufferGeometry, Float32BufferAttribute, Sphere, Vector3 } from 'three';

/** A modification of the standard three.js RingGeometry class, but with changes to support
 * Celestia-like ring textures.
 * Ported from the legacy Geometry/Face3 API to BufferGeometry, keeping the exact same vertices, faces and uvs.
 */
export default class RingGeometry2 extends BufferGeometry {
	constructor(innerRadius, outerRadius, thetaSegmentsP, phiSegmentsP, thetaStart = 0, thetaLength = Math.PI * 2) {
		super();
		this.type = 'RingGeometry2';

		const thetaSegments = thetaSegmentsP !== undefined ? Math.max(3, thetaSegmentsP) : 8;
		const phiSegments = phiSegmentsP !== undefined ? Math.max(3, phiSegmentsP) : 8;

		const positions = [];
		const normals = [];
		const uvs = [];
		const indices = [];
		let radius = innerRadius || 0;
		const radiusStep = (((outerRadius || 50) - radius) / phiSegments);

		for (let i = 0; i <= phiSegments; i++) { //concentric circles inside ring
			for (let o = 0; o <= thetaSegments; o++) { //number of segments per circle
				const x = radius * Math.cos(thetaStart + o / thetaSegments * thetaLength);
				const y = -radius * Math.sin(thetaStart + o / thetaSegments * thetaLength);
				positions.push(x, y, 0);
				normals.push(0, 0, 1);
				uvs.push(i / phiSegments, (y / radius + 1) / 2);
			}
			radius += radiusStep;
		}

		for (let i = 0; i < phiSegments; i++) { //concentric circles inside ring
			for (let o = 0; o <= thetaSegments; o++) { //number of segments per circle
				indices.push(
					o + (thetaSegments * i) + i,
					o + (thetaSegments * i) + thetaSegments + i,
					o + (thetaSegments * i) + thetaSegments + 1 + i
				);
				indices.push(
					o + (thetaSegments * i) + i,
					o + (thetaSegments * i) + thetaSegments + 1 + i,
					o + (thetaSegments * i) + 1 + i
				);
			}
		}

		this.setIndex(indices);
		this.setAttribute('position', new Float32BufferAttribute(positions, 3));
		this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
		this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

		this.boundingSphere = new Sphere(new Vector3(), radius);
	}
}
