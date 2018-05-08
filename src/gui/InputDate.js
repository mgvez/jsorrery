import $ from 'jquery';
import ExportValues from './ExportValues';
import { DATE_ID, DATE_DISPLAY_ID } from './Gui';

let inp;
let display;
let date;

export default {

	init(onChange, defaultDate) {
		if (!inp) {
			inp = $('<input>');
		}

		display = $(`#${DATE_DISPLAY_ID}`);

		let curDate;
		inp.off('change').on('change.jsorrery', () => {
			const dStr = inp.val();
			const m = dStr && dStr.trim().match(/(-?\d{1,6})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
			let newDate;
			if (m) {
				newDate = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5])));
			} else {
				newDate = new Date(dStr);
			}
			if (isNaN(newDate.getTime())) {
				newDate = new Date();
			}
			if (curDate !== newDate) {
				this.setDate(newDate);
				onChange();
			}
			curDate = newDate;
		});

		if (defaultDate) {
			this.setDate(new Date(defaultDate));
		}

	},

	getWidget() {
		return inp;
	},
	
	setDate(d) {
		date = d;
		if (d) {
			const dStr = d.toISOString();
			ExportValues.setVal(DATE_ID, dStr);
			if (inp) inp.val(dStr);
			if (display) display.text(dStr);
		}
	},

	getDate() {
		return date;
	},

};
