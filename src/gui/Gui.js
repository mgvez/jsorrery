
import $ from 'jquery';
import ExportValues from './ExportValues';
import InputDate from './InputDate';
import InputGeoCoord from './InputGeoCoord';
import InputSelect from './InputSelect';

export const PLANET_SCALE_ID = 'planetScale';
export const SCENARIO_ID = 'scenario';
export const START_ID = 'start';
export const SHARE_ID = 'share';
export const DATE_ID = 'date';
export const LOOKAT_ID = 'lookAt';
export const LOOKFROM_ID = 'lookFrom';
export const DELTA_T_ID = 'deltaT';
export const GEOLOC_ID = 'geoloc';

const FA = 'fa ';
const BTNS_CLASS = {
	share: FA + 'fa-share-alt',
	start: [FA + 'fa-play-circle', FA + 'fa-pause-circle'],
};

let defaultSettings;
let defaultCallbacks;

const controls = {};

function getContainer(id) {
	return $(`#${id}Cont`);
}

function removeControl(elId) {
	const el = controls[elId];
	if (el) el.remove();
}

function addControl(elId, el) {
	controls[elId] = el;
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
		const sel = new InputSelect(id, defaultSettings[id], callback);
		const widget = sel.getWidget();
		addControl(id, widget);
		getContainer(id).empty().addClass('dropdown').append(widget);
		return sel;
	},

	addDate(onChange) {
		InputDate.init(onChange, defaultSettings[DATE_ID]);
		InputDate.getWidget().appendTo(getContainer(DATE_ID));
		return InputDate;
	},
	
	addGeoloc(originalValues, onChange) {
		InputGeoCoord.init(defaultSettings[GEOLOC_ID] || originalValues, onChange);
		InputGeoCoord.getWidget().appendTo(getContainer(GEOLOC_ID).show());
		return InputGeoCoord;
	},

	removeGeoloc() {
		InputGeoCoord.sleep();
		getContainer(GEOLOC_ID).hide();
	},

	addSlider(id, options, onChange) {
		removeControl(id);
		const container = getContainer(id);
		const defaultVal = Number(defaultSettings[id]) || (options && options.initial) || 1;
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

	pushDefaultsCallbacks(callback) {
		defaultCallbacks = defaultCallbacks || [];
		defaultCallbacks.push(callback);
	},

	putDefaults() {
		if (!defaultCallbacks) return;
		defaultCallbacks.forEach(callback => callback());
		defaultCallbacks.length = 0;
	},

	//default settings for GUI when loading a scenario / a page
	setDefaults(v) {
		//console.log(defaultSettings);
		defaultSettings = v;
	},
};
