
import $ from 'jquery';
import TweenMax from 'gsap';
import InputDate from './InputDate';
import InputGeoCoord from './InputGeoCoord';
import InputSelect from './InputSelect';
import InputSlider from './InputSlider';
import InputButton from './InputButton';

export const PLANET_SCALE_ID = 'planetScale';
export const SCENARIO_ID = 'scenario';
export const START_ID = 'start';
export const SHARE_ID = 'share';
export const DATE_ID = 'date';
export const DATE_DISPLAY_ID = 'dateDisplay';
export const LOOKAT_ID = 'lookAt';
export const LOOKFROM_ID = 'lookFrom';
export const DELTA_T_ID = 'deltaT';
export const GEOLOC_ID = 'geoloc';

function hideContent(content) {
	TweenMax.killTweensOf(content);
	TweenMax.to(content, 0.3, {
		opacity: 0, 
		onComplete() {
			content.hide();
		}
	});
	return false;
}

function showContent(content) {
	TweenMax.killTweensOf(content);
	content.show();
	TweenMax.to(content, 0.3, {
		opacity: 1, 
	});
	return true;
}

export default class Gui {
	constructor() {
		this.gui = $('nav#gui');
		this.setupHelp();

		const collapser = $('#navCollapse');
		const collapsedClass = 'collapsed';
		const collapserUpClass = 'fa-angle-double-up';
		const collapserDownClass = 'fa-angle-double-down';

		collapser.on('click.jsorrery', () => {
			this.gui.toggleClass(collapsedClass);
			if (this.gui.hasClass(collapsedClass)) {
				collapser.addClass(collapserDownClass).removeClass(collapserUpClass);
			} else {
				collapser.addClass(collapserUpClass).removeClass(collapserDownClass);
			}
		});
	}

	addBtn(labelTx, id, onClick, key) {
		this.emptyContainer(id);
		const btn = new InputButton(labelTx, id, onClick, key);
		const widget = btn.getWidget();
		this.addWidget(id, widget);
	}

	addDropdown(id, callback) {
		this.emptyContainer(id);		
		const sel = new InputSelect(id, this.defaultSettings[id], callback, this);
		const widget = sel.getWidget();
		this.addWidget(id, widget, 'dropdown');	
		return sel;
	}

	addSlider(id, options, onChange) {
		this.emptyContainer(id);
		const defaultVal = Number(this.defaultSettings[id]) || (options && options.initial) || 1;
		const slider = new InputSlider(id, defaultVal, this.setOnChange(id, onChange), options, this);
		const widget = slider.getWidget();
		this.addWidget(id, widget);
	}

	addDate(onChange) {
		this.emptyContainer(DATE_ID);
		InputDate.init(this.setOnChange(DATE_ID, onChange), this.defaultSettings[DATE_ID]);
		this.addWidget(DATE_ID, InputDate.getWidget());
		return InputDate;
	}
	
	addGeoloc(originalValues, onChange) {
		this.emptyContainer(GEOLOC_ID);
		// console.log(defaultSettings[GEOLOC_ID]);
		// console.log(originalValues);
		InputGeoCoord.init(this.defaultSettings[GEOLOC_ID] || originalValues, this.setOnChange(GEOLOC_ID, onChange));
		this.addWidget(GEOLOC_ID, InputGeoCoord.getWidget());
		
		return InputGeoCoord;
	}

	removeGeoloc() {
		InputGeoCoord.sleep();
		this.hideGuiElement(GEOLOC_ID);
	}

	pushDefaultsCallbacks(callback) {
		this.defaultCallbacks = this.defaultCallbacks || [];
		this.defaultCallbacks.push(callback);
	}

	putDefaults() {
		if (!this.defaultCallbacks) return;
		this.defaultCallbacks.forEach(callback => callback());
		this.defaultCallbacks.length = 0;
	}

	//default settings for GUI when loading a scenario / a page
	setDefaults(v) {
		this.defaultSettings = v;
	}

	getContainer(id) {
		return $(`#${id}Cont`);
	}

	getLabel(id) {
		return $(`#${id}Label`);
	}

	hideGuiElement(id) {
		return this.getLabel(id).removeClass('shown');
	}

	emptyContainer(id) {
		this.getContainer(id).empty();
	}

	addWidget(id, widget, classes) {
		const c = this.getContainer(id);
		this.getLabel(id).addClass('shown');
		if (classes) c.addClass('dropdown');
		c.append(widget);
	}

	setOnChange(id, defaultOnChange) {
		const label = this.getLabel(id).find('.valDisplay');
		return (val) => {
			if (label.length) label.text(val);
			if (defaultOnChange) defaultOnChange(val);
		};
	}


	fadeGui(hasHelpShown) {
		const navToggleAction = hasHelpShown ? 'addClass' : 'removeClass';
		this.gui[navToggleAction]('faded');
	}

	setupHelp() {
		const allHelpContents = $('.helpContent');

		$('.help').each((i, el) => {
			let content;
			let shown = false;
			$(el).on('click.jsorrery', () => {
				if (!content) {
					content = allHelpContents.filter(`#${el.dataset.for}`);
					const close = content.find('.close');

					close.on('click.jsorrery', () => {
						shown = hideContent(content);
						fadeGui(shown);
					});
				}
				// console.log(content);
				hideContent(allHelpContents.not(content));
				shown = shown ? hideContent(content) : showContent(content);
				fadeGui(shown);
			});
		});
		//default open help on load page, if any
		const defaultHelpOpen = window.jsOrrery && window.jsOrrery.defaults && window.jsOrrery.defaults.showHelp;
		if (defaultHelpOpen) {
			$(`.help[data-for="${defaultHelpOpen}"]`).trigger('click');
		}
	}
};
