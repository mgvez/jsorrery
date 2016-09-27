import $ from 'jquery';
import ExportValues from './ExportValues';

let widget;
let twitterContainer;
let urlInput;
const baseLink = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;

function twitterParseAttempt() {
	const twttr = window.twttr || null;
	if(twttr) {
		twttr.widgets.load();
		return null;
	}
	setTimeout(twitterParseAttempt, 100);
};

function setup() {
	if(widget) return null;
	widget = $('#shareWidget');
	twitterContainer = $('#twitterShare');
	urlInput = $('#shareUrl');
	widget.on('click.sharer', (e) => {
		e.stopPropagation();
	});
};

export default {
	
	show() {
		setup();

		const exportVals = ExportValues.getExport();
		var qstr = _.reduce(_.pairs(exportVals), function(memo, pair){
			memo.push(pair.join('='));
			return memo;
		}, []).join('&');

		const completeLink = `${baseLink}?${qstr}`;

		var onShortened = $.Deferred();
		if(ns.gapi && ns.gapi.client.urlshortener) {
			var request = ns.gapi.client.urlshortener.url.insert({
				resource: {
					longUrl: completeLink
				}
			});
			request.execute(function(response) {
				onShortened.resolve(response.id || completeLink);
			});

		} else {
			onShortened.resolve(completeLink);
		}

		onShortened.then(function(link){

			urlInput.val(link);
			var twLink = '<a href="https://twitter.com/share" class="twitter-share-button" data-counturl="'+baseLink+'" data-url="' + link +'" data-via="'+twitterContainer.data('via')+'">Tweet</a>';
			twitterContainer.html(twLink);
			twitterParseAttempt();

			widget.fadeIn(200, function(){
				urlInput.get(0).select();
			});

			var b = $('html');
			b.on('click.sharer', function(){
				b.off('.sharer');
				widget.fadeOut(200);
			});

		});
		
	}

};