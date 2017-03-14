
import $ from 'jquery';

export default {
	init(renderer, params) {
		this.i = 0;
		this.renderer = renderer;

		this.params = Object.assign({
			interval: 5,
		}, params);

		return this;
	},

	capture() {
		
		if (this.i % this.params.interval === 0) {
			const img = this.renderer.domElement.toDataURL();
			$.ajax({
				type: 'post',
				url: '/_workdir/save.php',
				data: {
					im: img,
					i: this.i,
				},
				success(data) {// eslint-disable-line
					//console.log(data)
				},
				error(a, b, c) {
					console.log(a, b, c);// eslint-disable-line
				},
			});
		}
		this.i++;
	},
};
