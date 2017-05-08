import ExportValues from './ExportValues';
import { DATE_ID } from './Gui';


let inp;
let date;

export default {

	init(onChange) {
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

		let defaultDate = this.defaultSettings[DATE_ID];
		if (defaultDate) {
			defaultDate = new Date(defaultDate);
			this.setDate(defaultDate);
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
