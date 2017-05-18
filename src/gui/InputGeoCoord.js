import $ from 'jquery';
import GeoCoord from 'utils/GeoCoord';
import ExportValues from './ExportValues';
import { GEOLOC_ID } from './Gui';

let inp;
let loc;

export default {

	init(defaultVals, onChange) {
		if (!inp) {
			inp = $('<input>');
		}

		loc = new GeoCoord(defaultVals.lat, defaultVals.lng);
		inp.val(loc.getString());

		inp.off('change').on('change.jsorrery', () => {
			loc.setFromString(inp.val());
			inp.val(loc.getString());		
			onChange(loc.getLoc());
			ExportValues.setVal(GEOLOC_ID, loc.getLoc());
		});
	},

	sleep() {
		if (inp) inp.off('change');
	},

	getWidget() {
		return inp;
	},

	getLoc() {
		return loc.getLoc();
	},

};
