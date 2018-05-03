import $ from 'jquery';
import ExportValues from './ExportValues';

let widget;
let twitterContainer;
let urlInput;
const baseLink = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;

function twitterParseAttempt() {
	const twttr = window.twttr || null;
	if (twttr) {
		twttr.widgets.load();
	} else {
		setTimeout(twitterParseAttempt, 100);
	}
}

function setup() {
	if (widget) return null;
	widget = $('#shareWidget');
	twitterContainer = $('#twitterShare');
	urlInput = $('#shareUrl');
	widget.on('click.sharer', (e) => {
		e.stopPropagation();
	});
	return null;
}

export default {
	
	show() {
		setup();

		const exportVals = ExportValues.getExport();
		const qstr = Object.keys(exportVals).map(key => `${key}=${exportVals[key]}`).join('&');
		const completeLink = `${baseLink}?${qstr}`;
		// console.log(completeLink);
		const onShortened = new Promise(resolve => {
			resolve(completeLink);
		});

		onShortened.then(link => {

			urlInput.val(link);
			const twLink = `<a href="https://twitter.com/share" class="twitter-share-button" data-counturl="${baseLink}" data-url="${link}" data-via="` + twitterContainer.data('via') + '">Tweet</a>';
			twitterContainer.html(twLink);
			twitterParseAttempt();

			widget.fadeIn(200, () => {
				urlInput.get(0).select();
			});

			const b = $('html');
			b.on('click.sharer', () => {
				b.off('.sharer');
				widget.fadeOut(200);
			});

		});
		
	},

};
