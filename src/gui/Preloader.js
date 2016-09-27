import { TweenMax } from '../utils/Greensock';

let preloader;
function getNode() {
	if (preloader) return preloader;
	preloader = document.getElementById('preload');
	return preloader;
}

export default {
	
	remove() {
		TweenMax.to(getNode(), 0.5, {
			opacity: 0,
			onComplete() {
				getNode().style.display = 'none';
			},
		});
	},

	show() {
		const p = getNode();
		TweenMax.killTweensOf(p);
		p.style.display = 'block';
		TweenMax.to(p, 0.5, { opacity: 1 });
	},

};
