
import { TweenMax } from 'gsap';
import Promise from 'bluebird';

let preloader;
function getNode() {
	if (preloader) return preloader;
	preloader = document.getElementById('preload');
	return preloader;
}

export default {
	
	remove() {
		const node = getNode();
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
	},

	show() {
		const node = getNode();
		if (!node) return;
		TweenMax.killTweensOf(node);
		node.style.display = 'block';
		TweenMax.to(node, 0.5, { opacity: 1 });
	},

};
