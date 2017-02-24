
import { Texture, Sprite, SpriteMaterial, Box3 } from 'three';

const BASE_SIZE = 40;

function createLabel(tx) {

	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	canvas.width = 1024;
	canvas.height = 64;
	context.font = `${BASE_SIZE}px Sans-serif`;	
	context.fillStyle = 'rgba(255, 255, 255, 1.0)';
	const dim = context.measureText(tx);
	// console.log(dim);
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;

	const radius = 30;
	context.fillText(tx, centerX - (dim.width + radius * 1.2), BASE_SIZE);

	context.beginPath();
	context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	context.lineWidth = 1;
	context.strokeStyle = 'rgba(255, 255, 255, 1.0)';
	context.stroke();

	const texture = new Texture(canvas);
	texture.needsUpdate = true;

	const spriteMaterial = new SpriteMaterial({ map: texture });
	const sprite = new Sprite(spriteMaterial);
	sprite.scale.set(1024, 64, 1);
	sprite.position.set(0, 0, 0);
	return sprite;	
}


export default function Label(tx) {
	const sprite = createLabel(tx);
	this.getDisplayObject = () => {
		return sprite;
	};

	this.onMove = (pos) => {
		const bbox = new Box3().setFromObject(sprite);
		console.log(bbox);

	};
}
