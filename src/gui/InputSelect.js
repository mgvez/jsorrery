import $ from 'jquery';
import ExportValues from './ExportValues';
import Gui from './Gui';

export default class InputSelect {

	constructor(id, defaultVal, callback) {
		this.id = id;
		this.input = $(`<input id="${id}_inp">`).on('change.jsorrery', callback);
		this.display = $('<div class="display">');
		this.list = $(`<ul id="${id}">`);
		this.options = {};

		this.defaultVal = defaultVal;
	}

	getWidget() {
		return [this.display, this.list];
	}
	
	addOption(label, val, isSelected) {

		const option = this.options[val] = $(`<li data-value="${val}">${label}</li>`);
		option.on('click.jsorrery', this.clickHandler);

		if (this.list.children().length === 0) {
			this.input.val(val);
			this.display.html(label);
			ExportValues.setVal(this.id, val);
		}

		option.appendTo(this.list);

		if (isSelected || this.defaultVal === val) {
			Gui.pushDefaultsCallbacks(() => {
				this.listClicked(option);
			});
		}

	}

	toggleOptions(toToggle, isShow) {
		const options = this.options;
		const toggleFcn = isShow ? 'removeClass' : 'addClass';
		const curVal = this.input.val();
		// if (!isShow && ~toToggle.indexOf(curVal)) {
		// 	selects[selectName].input.val('');
		// }
		// toToggle.forEach((optId) => {
		// 	if (options[optId]) options[optId][toggleFcn]('disabled');
		// });
	}

	getValue() {
		return this.input.val();
	}

	listClicked(clickedOption) {
		const val = clickedOption.data('value');
		this.display.html(clickedOption.html());
		this.input.val(val).trigger('change');
		ExportValues.setVal(this.id, val);
	}

	clickHandler = (e) => {
		this.listClicked($(e.currentTarget));
	}
	
}
