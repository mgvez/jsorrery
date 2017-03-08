
import { Object3D, MeshBasicMaterial, Mesh, SphereGeometry, ArrowHelper } from 'three';
import { getUniverse } from 'JSOrrery';

const points = [];
const arrows = [];

export default {
	
	add(pos, color, size = 0.3) {

		const p = new Mesh(
			new SphereGeometry(size, 10, 10),
			new MeshBasicMaterial({ color })
		);
		p.position.copy(pos);

		getUniverse().getScene().getRoot().add(p);
		points.push(p);
		return points.length - 1;

	},

	removeAll() {
		points.forEach(p => {
			getUniverse().getScene().getRoot().remove(p);
		});
		points.length = 0;
		arrows.forEach(p => {
			getUniverse().getScene().getRoot().remove(p);
		});
		arrows.length = 0;
	},
	
	addArrow(pos, dir, l = 20, color = 0x666666) {
		if (!dir || !pos) return;
		getUniverse().getScene().getRoot().remove(this.vel);		
		const a = new ArrowHelper(dir.clone().normalize(), pos.clone(), l, color);
		getUniverse().getScene().getRoot().add(a);
		arrows.push(a);
	}

};
