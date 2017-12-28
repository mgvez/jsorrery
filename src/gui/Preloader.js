
import { TweenMax } from 'gsap';
import Promise from 'bluebird';



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
			TweenMax.to(node, 0.5, {
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
		TweenMax.killTweensOf(node);
		node.style.display = 'block';
		TweenMax.to(node, 0.5, { opacity: 1 });
	}
};
