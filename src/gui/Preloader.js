import { gsap } from 'gsap';



export default class Preloader {
	
	constructor(rootElement) {
		let preloader;
		this.getNode = () => {
			if (preloader) return preloader;
			preloader = rootElement.getElementsByClassName('preload');
			preloader = preloader && preloader[0];
			return preloader;
		}
	}

	remove() {
		const node = this.getNode();
		if (!node) return Promise.resolve();
		return new Promise(resolve => {
			gsap.to(node, {
				duration: 0.5,
				opacity: 0,
				onComplete() {
					node.style.display = 'none';
					resolve();
				},
			});
		});
	}

	show() {
		const node = this.getNode();
		if (!node) return;
		gsap.killTweensOf(node);
		node.style.display = 'block';
		gsap.to(node, { duration: 0.5, opacity: 1 });
	}
};
