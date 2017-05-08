import $ from 'jquery';
import ExportValues from './ExportValues';
import { DATE_ID, getContainer } from './Gui';

let inp;
let date;

export default {

	init(onChange, defaultDate) {
		if (!inp) {
			inp = $('<input>').appendTo(getContainer(DATE_ID));
		}

		let curDate;
		inp.off('change').on('change.jsorrery', () => {
			let newDate = new Date(inp.val());
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
	
	setDate(d) {
		date = d;
		if (d) {
			const dStr = d.toISOString();
			ExportValues.setVal(DATE_ID, dStr);
			if (inp) inp.val(dStr);
		}
	},

	getDate() {
		return date;
	},

};
