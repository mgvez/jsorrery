import $ from 'jquery';
import GeoCoord from '../utils/GeoCoord';
import ExportValues from './ExportValues';
import { GEOLOC_ID } from './Gui';

const inp = $('<input>');
let loc;

export default {

	init(defaultVals, onChangeCallback) {
		loc = new GeoCoord();
		if (typeof defaultVals === 'string') {
			loc.setFromString(defaultVals);			
		} else {
			loc.setValue(defaultVals);
		}
		inp.val(loc.getString());

		function onChange() {
			loc.setFromString(inp.val());
			inp.val(loc.getString());		
			onChangeCallback(loc.getLoc());
			ExportValues.setVal(GEOLOC_ID, loc.getString());
		}
		
		inp.off('change').on('change.jsorrery', onChange);
		onChange();
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
