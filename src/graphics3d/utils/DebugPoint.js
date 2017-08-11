
import { MeshBasicMaterial, Mesh, SphereGeometry, ArrowHelper } from 'three';

const points = [];
const arrows = [];
let container;

export default {
	
	add(pos, color, size = 0.3) {

		const p = new Mesh(
			new SphereGeometry(size, 10, 10),
			new MeshBasicMaterial({ color })
		);
		p.position.copy(pos);

		container.add(p);
		points.push(p);
		return points.length - 1;

	},

	removeAll() {
		points.forEach(p => {
			container.remove(p);
		});
		points.length = 0;
		arrows.forEach(p => {
			container.remove(p);
		});
		arrows.length = 0;
	},
	
	addArrow(pos, dir, l = 20, color = 0x666666) {
		if (!dir || !pos) return;
		container.remove(this.vel);		
		const a = new ArrowHelper(dir.clone().normalize(), pos.clone(), l, color);
		container.add(a);
		arrows.push(a);
	},

	setContainer(c) {
		container = c;
	},

};
