import { MeshBasicMaterial, Mesh, SphereGeometry, ArrowHelper, type Object3D, type Vector3, type ColorRepresentation } from 'three';

/** Debugging helpers: add points / arrows to the scene. */

const points: Mesh[] = [];
const arrows: ArrowHelper[] = [];
let container: Object3D | undefined;

export function add(pos: Vector3, color: ColorRepresentation, size = 0.3) {
	if (!container) return -1;
	const p = new Mesh(
		new SphereGeometry(size, 10, 10),
		new MeshBasicMaterial({ color })
	);
	p.position.copy(pos);

	container.add(p);
	points.push(p);
	return points.length - 1;
}

export function removeAll() {
	points.forEach(p => container?.remove(p));
	points.length = 0;
	arrows.forEach(p => container?.remove(p));
	arrows.length = 0;
}

export function addArrow(pos: Vector3, dir: Vector3, l = 20, color: ColorRepresentation = 0x666666) {
	if (!dir || !pos || !container) return;
	const a = new ArrowHelper(dir.clone().normalize(), pos.clone(), l, color);
	container.add(a);
	arrows.push(a);
}

export function setContainer(c: Object3D) {
	container = c;
}
