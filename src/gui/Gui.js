
import $ from 'jquery';
import { Promise } from 'bluebird';
import { TweenMax } from 'gsap';
import ExportValues from './ExportValues';

const BTNS_LABELS = {
	share: '&#59196;',
	start: ['&#9654;', '&#8214;'],
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
	const shown = content.filter('.shown');
	return new Promise(resolve => {
		if (shown.length > 0) {
			TweenMax.killTweensOf(shown);
			TweenMax.to(
				shown,
				0.5,
				{ 
					css: { height: 1, opacity: 0 }, 
					onComplete: () => {
						shown.hide();
						shown.removeClass('shown');
						resolve();
					},
				}
			);
		} else {
			resolve();
		}
	});
}

function showContent(content) {
	TweenMax.killTweensOf(content);
	TweenMax.from(content.show().css({ height: 'auto', opacity: 1 }), 0.5, { css: { height: 1, opacity: 0 } });
	content.addClass('shown');
}

function setupHelp() {
	const allHelpContents = $('.helpContent');

	$('.help').each((i, el) => {
		$(el).on('click.jsorrery', (e) => {
			e.preventDefault();
			let content = el.dataset.content;
			if (!content) {
				content = allHelpContents.filter(`#${el.dataset.for}`);
				el.dataset.content = content;
				content.find('.close').on('click.jsorrery', () => {
					hideContent(content);
				});
			}

			const onHidden = hideContent(allHelpContents);
			onHidden.then(() => {
				showContent(content);
			});
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

	addBtn(labelParam, id, callback) {
		removeControl(id);
		const label = BTNS_LABELS[id] || labelParam;
		let labelOff;
		let labelOn;
		if (label instanceof Array) {
			labelOff = label[0];
			labelOn = label[1];
		} else {
			labelOff = label;
		}
		let status = false;
		const btn = controls[id] = $(`<button id="${id}">${labelOff}</button>`).appendTo(getContainer(id));
		btn.on('click.jsorrery', (e) => {
			e.stopPropagation();
			callback();
			status = !status;
			if (status && labelOn) {
				btn.html(labelOn);
			} else {
				btn.html(labelOff);
			} 
		});
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
		const options = selects[selectName].options;
		const toggleFcn = isShow ? 'removeClass' : 'addClass';
		const curVal = selects[selectName].input.val();
		if (!isShow && !~toToggle.indexOf(curVal)) {
			selects[selectName].input.val('');
		}
		toToggle.forEach((optId) => {
			if (options[optId]) options[optId][toggleFcn]('disabled');
		});
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
		const valDisplay = getLabel(id).find('.valDisplay').text('1');

		function setSlideValue(val) {
			valDisplay.text(val);
			onChange(val);
		}

		const defaultVal = Number(this.defaultSettings[id]);
		const params = {
			slide(evt, ui) {
				let val = ui.value;
				val = val < 1 ? 1 : val;
				ExportValues.setVal(id, val);
				setSlideValue(val);
			},
			value: defaultVal || (options && options.initial) || 1,
		};

		if (options && options.min) params.min = options.min;
		if (options && options.max) params.max = options.max;

		console.warn('replace slider jq ui');
		const slider = $('<div>').appendTo(container);//.slider(params);

		controls[id] = slider;

		if (defaultVal) {
			this.pushDefaultsCallbacks(() => {
				setSlideValue(defaultVal);
			});
		}

		ExportValues.setVal(id, defaultVal || 1);

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
		return;
	},

	setDefaults(defaultSettings) {
		//console.log(defaultSettings);
		this.defaultSettings = defaultSettings;
	},
};
