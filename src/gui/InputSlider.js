import $ from 'jquery';
import ExportValues from './ExportValues';

export default class InputSlider {

	constructor(id, defaultVal, onChange, { min = 1, max = 100, step = 1 }, gui) {

		this.slider = $(`<input type ="range" min="${min}" max="${max}" step="${step}" value ="${defaultVal}"/>`);

		this.slider.off('input').on('input.jsorrery', () => {
			const val = this.slider.val();
			ExportValues.setVal(id, val);
			onChange(val);
		});


		if (defaultVal) {
			gui.pushDefaultsCallbacks(() => {
				this.setSlideValue(defaultVal);
				onChange(defaultVal);
			});
		}

		ExportValues.setVal(id, defaultVal);

	}

	getWidget() {
		return this.slider;
	}

	setSlideValue(val) {
		this.slider.val(val);
	}
	
}
