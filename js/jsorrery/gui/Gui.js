
define(
	[
		'jsorrery/NameSpace',
		'jquery',
		'jsorrery/gui/ExportValues',
		'ui',
		'_',
		'vendor/greensock/TweenMax',
		'vendor/greensock/easing/EasePack'
	],
	function(ns, $, ExportValues){
		'use strict';
		var elements = {};

		var BTNS_LABELS = {
			share : '&#59196;',
			start : ['&#9654;', '&#8214;']
 		};

		var removeElement = function(elId){
			elements[elId] && elements[elId].remove();
		};

		var getContainer = function(id){
			return $('#'+id+'Cont');
		};
		var getLabel = function(id){
			return $('#'+id+'Label');
		};

		var listClicked = function(id, selector, clickedOption, input){
			var val = clickedOption.data('value');
			selector.display.html(clickedOption.html());
			input.val(val).trigger('change');
			ExportValues.setVal(id, val);

		};

		var setupHelp = function(){
			var allHelpContents = $('.helpContent');

			var hideContent = function(content){
				var shown = content.filter('.shown');
				var onDone = $.Deferred();
				if(shown.length>0){
					TweenMax.killTweensOf(shown);
					TweenMax.to(shown, 0.5, {css:{height:1, opacity:0}, onComplete:function(){
							shown.hide();
							shown.removeClass('shown');
							onDone.resolve();
						}
					});
				} else {
					onDone.resolve();
				}
				return onDone.promise();
			};
			var showContent = function(content){
				TweenMax.killTweensOf(content);
				TweenMax.from(content.show().css({height:'auto', opacity:1}), 0.5, {css:{height:1, opacity:0}});
				content.addClass('shown');
			};

			$('.help').on('click.jsorrery', function(e){
				e.preventDefault();
				var _self = $(this);
				var content = _self.data('content');
				if(!content){
					content = allHelpContents.filter('#'+_self.data('for'));
					_self.data('content', content);
					content.find('.close').on('click.jsorrery', function(){
						hideContent(content);
					});
				}

				var onHidden = hideContent(allHelpContents);
				onHidden.then(function(){
					showContent(content)
				});
				return false;
			});
		};

		var dateDisplay;
		var date;

		return {

			PLANET_SCALE_ID : 'planetScale',
			SCENARIO_ID : 'scenario',
			START_ID : 'start',
			SHARE_ID : 'share',
			DATE_ID : 'date',
			LOOKAT_ID : 'lookAt',
			LOOKFROM_ID : 'lookFrom',
			DELTA_T_ID : 'deltaT',

			init : function(universe){
				this.root = $('#gui');
				this.selects = {};

				setupHelp();
			},

			addBtn : function(label, id, callback) {
				removeElement(id);
				label = BTNS_LABELS[id] || label;
				var labelOff;
				var labelOn;
				if(label instanceof Array) {
					labelOff = label[0];
					labelOn = label[1];
				} else {
					labelOff = label;
				}
				var status = false;
				var btn = elements[id] = $('<button id="'+id+'">'+labelOff+'</button>').appendTo(getContainer(id));
				btn.on('click.orrery', function(e){
					e.stopPropagation();
					callback();
					status = !status;
					if(status && labelOn){
						btn.html(labelOn);
					} else {
						btn.html(labelOff);
					} 
				});
			},
			
			addDropdown : function(id, callback){
				removeElement(id);
				var dropdownContainer = getContainer(id).empty().addClass('dropdown');
				var dropdownDisplay = $('<div class="display">').appendTo(dropdownContainer);
				var selector = this.selects[id] = {
					input : $('<input id="'+id+'_inp">').on('change.orrery', callback),
					display: dropdownDisplay,
					list : $('<ul id="'+id+'">').appendTo(dropdownContainer),
					options : {}
				};

				var list = elements[id] = selector.list;
				var input = selector.input;

				this.selects[id].clickHandler = function(e){
					listClicked(id, selector, $(this), input);
				};

				return this.selects[id].input;
			},

			addOption : function(selectName, label, val, isSelected) {
				var sel = this.selects[selectName];
				if(!sel) return;

				var option = sel.options[val] = $('<li data-value="'+val+'">'+label+'</li>');
				option.on('click.jsorrery', sel.clickHandler);

				if(sel.list.children().length === 0) {
					sel.input.val(val);
					sel.display.html(label);

					ExportValues.setVal(selectName, val);
				}

				option.appendTo(sel.list);

				var defaultVal = this.defaultSettings && this.defaultSettings[selectName];
				if(isSelected || defaultVal == val) {
					this.pushDefaultsCallbacks(function(){
						listClicked(selectName, sel, option, sel.input)
					});
				}

			},

			toggleOptions : function(selectName, toToggle, isShow){
				var options = this.selects[selectName].options;
				var toggleFcn = isShow ? 'removeClass' : 'addClass';
				var curVal = this.selects[selectName].input.val();
				if(!isShow && toToggle.indexOf(curVal) !== -1) {
					this.selects[selectName].input.val('');
				}
				_.each(toToggle, function(optId){
					options[optId] && options[optId][toggleFcn]('disabled');
					//options[optId] && options[optId].prop('disabled', !isShow);
				});
			},

			addDate : function(onChange){
				if(!dateDisplay) {
					dateDisplay = $('<input>').appendTo(getContainer(this.DATE_ID));
					/*dateDisplay.datepicker({
						dateFormat : $.datepicker.ATOM,
						changeYear : true
					});/**/
				}
				var curDate;
				dateDisplay.off('change').on('change.jsorrery', function(){
					var newDate = new Date(dateDisplay.val());
					if(isNaN(newDate.getTime())){
						newDate = new Date();
					}
					if(curDate != newDate){
						this.setDate(newDate);
						onChange();
					}
					curDate = newDate;
				}.bind(this));

				var defaultDate = this.defaultSettings[this.DATE_ID];
				if(defaultDate){
					defaultDate = new Date(defaultDate);
					this.setDate(defaultDate);
				}

				return dateDisplay;
			},

			setDate : function(d){
				date = d;
				if(d){
					var dStr = d.toISOString();
					ExportValues.setVal(this.DATE_ID, dStr);
					dateDisplay.val(dStr);
					//dateDisplay.val($.datepicker.formatDate( $.datepicker.ATOM, d));
				}
			},

			getDate : function(){
				return date;
			},

			addSlider : function(id, options, onChange) {
				removeElement(id);
				var container = getContainer(id);
				var valDisplay = getLabel(id).find('.valDisplay').text('1');

				var defaultVal = Number(this.defaultSettings[id]);
				var params = {
					slide : function(evt, ui){
						var val = ui.value;
						val = val < 1 ? 1 : val;
						ExportValues.setVal(id, val);
						setSlideValue(val);
					},
					value : defaultVal || (options && options.initial) || 1
				};

				if(options && options.min) params.min = options.min;
				if(options && options.max) params.max = options.max;

				var slider = $('<div>').appendTo(container).slider(params);

				elements[id] = slider;

				var setSlideValue = function(val){
					valDisplay.text(val);
					onChange(val);
				};

				if(defaultVal) {
					this.pushDefaultsCallbacks(function(){
						setSlideValue(defaultVal)
					});
				}

				ExportValues.setVal(id, defaultVal || 1);

				return slider;
			},

			remove : function(id){
				removeElement(id);
			},

			pushDefaultsCallbacks : function(callback){
				this.defaultCallbacks = this.defaultCallbacks || [];
				this.defaultCallbacks.push(callback);
			},

			putDefaults : function(){
				if(!this.defaultCallbacks) return;
				_.each(this.defaultCallbacks, function(callback){
					callback();
				});
				this.defaultCallbacks.length = 0;
			},

			getDefaultCameraPos : function() {
				
			},

			setDefaults : function(defaultSettings) {
				//console.log(defaultSettings);
				this.defaultSettings = defaultSettings;
			}
		};
	}
);