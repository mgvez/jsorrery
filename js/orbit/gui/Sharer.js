
define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/gui/ExportValues'
	],
	function(ns, $, ExportValues){
		'use strict';

		var widget;
		var twitterContainer;
		var urlInput;

		var twitterParseAttempt = function() {
			var twttr = window.twttr || null;
			if(twttr) {
				twttr.widgets.load();
				return;
			}
			setTimeout(twitterParseAttempt, 100);
		};

		var setup = function(){
			if(widget) return;
			widget = $('#shareWidget');
			twitterContainer = $('#twitterShare');
			urlInput = $('#shareUrl');
			widget.on('click.sharer', function(e){
				e.stopPropagation();
			});
		};

		return {
			
			show : function(){
				setup();

				var exports = ExportValues.getExport();
				var qstr = _.reduce(_.pairs(exports), function(memo, pair){
					memo.push(pair.join('='));
					return memo;
				}, []).join('&');

				var link = window.location.protocol + '//' + window.location.host + window.location.pathname+'?'+qstr;
				urlInput.val(link);

				var lnk = '<a href="https://twitter.com/share" class="twitter-share-button" data-url="' + link +'" data-via="'+twitterContainer.data('via')+'">Tweet</a>';
				twitterContainer.html(lnk);
				twitterParseAttempt();

				widget.fadeIn(200, function(){
					urlInput.get(0).select();
				});

				var b = $('html');
				b.on('click.sharer', function(){
					b.off('.sharer');
					widget.fadeOut(200);
				});
			}

		};
	}
);