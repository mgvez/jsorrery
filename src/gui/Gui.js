
import $ from 'jquery';
import ExportValues from './ExportValues';

const FA = 'fa ';
const BTNS_CLASS = {
	share: FA + 'fa-share-alt',
	start: [FA + 'fa-play-circle', FA + 'fa-pause-circle'],
};


const controls = {};
const selects = {};
let dateDisplay;
let date;

function removeControl(elId) {
	const el = controls[elId];
	if (el) el.remove();
}

function getContainer(id) {
	return $(`#${id}Cont`);
}

function getLabel(id) {
	return $(`#${id}Label`);
}

function hideContent(content) {
	content.removeClass('shown');
	return false;
}

function showContent(content) {
	content.addClass('shown');
	return true;
}

function setupHelp() {
	const allHelpContents = $('.helpContent');

	$('.help').each((i, el) => {
		let content;
		let shown = false;
		$(el).on('click.jsorrery', (e) => {
			e.preventDefault();
			if (!content) {
				content = allHelpContents.filter(`#${el.dataset.for}`);
				content.find('.close').on('click.jsorrery', () => {
					shown = hideContent(content);
				});
			}
			// console.log(content);
			hideContent(allHelpContents);
			shown = shown ? hideContent(content) : showContent(content);
		});
	});
}

function listClicked(id, selector, clickedOption, input) {
	const val = clickedOption.data('value');
	selector.display.html(clickedOption.html());
	input.val(val).trigger('change');
	ExportValues.setVal(id, val);
}


export const PLANET_SCALE_ID = 'planetScale';
export const SCENARIO_ID = 'scenario';
export const START_ID = 'start';
export const SHARE_ID = 'share';
export const DATE_ID = 'date';
export const LOOKAT_ID = 'lookAt';
export const LOOKFROM_ID = 'lookFrom';
export const DELTA_T_ID = 'deltaT';

export default {
	init() {
		setupHelp();
	},

	addBtn(labelParam, id, callback, key) {
		removeControl(id);
		const classNames = BTNS_CLASS[id];
		let classOff;
		let classOn;
		if (classNames instanceof Array) {
			classOff = classNames[0];
			classOn = classNames[1];
		} else {
			classOff = classNames;
		}
		const label = classOff ? '&nbsp;' : labelParam;
		let status = false;

		const btn = controls[id] = $(`<button class="${classOff}" id="${id}">${label}</button>`).appendTo(getContainer(id));
		btn.on('click.jsorrery', (e) => {
			e.stopPropagation();
			callback();
			status = !status;
			const targetClass = (status && classOn) || classOff;
			btn.attr('class', targetClass);
		});

		if (key) {
			const keyCode = key.toUpperCase().charCodeAt(0);
			$(window).on('keyup.jsorrery', (e) => {
				// console.log(e.keyCode, keyCode);
				// console.log(String.fromCharCode(e.keyCode), String.fromCharCode(keyCode));
				if (e.keyCode === keyCode) btn.trigger('click');
			});
		}
	},

	addDropdown(id, callback) {
		removeControl(id);
		const dropdownContainer = getContainer(id).empty().addClass('dropdown');
		const dropdownDisplay = $('<div class="display">').appendTo(dropdownContainer);
		const selector = selects[id] = {
			input: $(`<input id="${id}_inp">`).on('change.jsorrery', callback),
			display: dropdownDisplay,
			list: $(`<ul id="${id}">`).appendTo(dropdownContainer),
			options: {},
		};

		controls[id] = selector.list;
		const input = selector.input;

		selects[id].clickHandler = (e) => {
			listClicked(id, selector, $(e.currentTarget), input);
		};

		return selects[id].input;
	},

	addOption(selectName, label, val, isSelected) {
		const sel = selects[selectName];
		if (!sel) return;

		const option = sel.options[val] = $(`<li data-value="${val}">${label}</li>`);
		option.on('click.jsorrery', sel.clickHandler);

		if (sel.list.children().length === 0) {
			sel.input.val(val);
			sel.display.html(label);
			ExportValues.setVal(selectName, val);
		}

		option.appendTo(sel.list);

		const defaultVal = this.defaultSettings && this.defaultSettings[selectName];
		if (isSelected || defaultVal === val) {
			this.pushDefaultsCallbacks(() => {
				listClicked(selectName, sel, option, sel.input);
			});
		}

	},

	toggleOptions(selectName, toToggle, isShow) {
		// const options = selects[selectName].options;
		// const toggleFcn = isShow ? 'removeClass' : 'addClass';
		// const curVal = selects[selectName].input.val();
		// if (!isShow && ~toToggle.indexOf(curVal)) {
		// 	selects[selectName].input.val('');
		// }
		// toToggle.forEach((optId) => {
		// 	if (options[optId]) options[optId][toggleFcn]('disabled');
		// });
	},

	addDate(onChange) {
		if (!dateDisplay) {
			dateDisplay = $('<input>').appendTo(getContainer(DATE_ID));
		}

		let curDate;
		dateDisplay.off('change').on('change.jsorrery', () => {
			let newDate = new Date(dateDisplay.val());
			if (isNaN(newDate.getTime())) {
				newDate = new Date();
			}
			if (curDate !== newDate) {
				this.setDate(newDate);
				onChange();
			}
			curDate = newDate;
		});

		let defaultDate = this.defaultSettings[DATE_ID];
		if (defaultDate) {
			defaultDate = new Date(defaultDate);
			this.setDate(defaultDate);
		}

		return dateDisplay;
	},

	setDate(d) {
		date = d;
		if (d) {
			const dStr = d.toISOString();
			ExportValues.setVal(DATE_ID, dStr);
			if (dateDisplay) dateDisplay.val(dStr);
		}
	},

	getDate() {
		return date;
	},

	addSlider(id, options, onChange) {
		removeControl(id);
		const container = getContainer(id);
		const defaultVal = Number(this.defaultSettings[id]) || (options && options.initial) || 1;
		const valDisplay = getLabel(id).find('.valDisplay').text(defaultVal);

		const min = (options && options.min) || 1;
		const max = (options && options.max) || 100;
		const step = (options && options.step) || 1;

		const slider = $(`<input type ="range" min="${min}" max="${max}" step="${step}" value ="${defaultVal}"/>`).appendTo(container);

		slider.off('input').on('input.jsorrery', () => {
			const val = slider.val();
			valDisplay.text(val);
			ExportValues.setVal(id, val);
			onChange(val);
		});

		function setSlideValue(val) {
			slider.val(val);
		}

		controls[id] = slider;

		if (defaultVal) {
			this.pushDefaultsCallbacks(() => {
				setSlideValue(defaultVal);
				onChange(defaultVal);
			});
		}

		ExportValues.setVal(id, defaultVal);

		return slider;
	},

	remove(id) {
		removeControl(id);
	},

	pushDefaultsCallbacks(callback) {
		this.defaultCallbacks = this.defaultCallbacks || [];
		this.defaultCallbacks.push(callback);
	},

	putDefaults() {
		if (!this.defaultCallbacks) return;
		this.defaultCallbacks.forEach(callback => callback());
		this.defaultCallbacks.length = 0;
	},

	getDefaultCameraPos() {

	},

	setDefaults(defaultSettings) {
		//console.log(defaultSettings);
		this.defaultSettings = defaultSettings;
	},
};
