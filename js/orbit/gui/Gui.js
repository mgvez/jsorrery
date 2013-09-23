
define(
	[
		'orbit/NameSpace',
		'jquery',
		'ui',
		'_'
	],
	function(){
		'use strict';
		var elements = {};

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
			exportingValues[id] = val;

		};

		var dateDisplay;
		var date;

		var exportingValues = {};
		

		return {

			PLANET_SCALE_ID : 'planetScale',
			SCENARIO_ID : 'scenario',
			START_ID : 'start',
			LINK_ID : 'link',
			DATE_ID : 'date',
			LOOKAT_ID : 'lookAt',
			LOOKFROM_ID : 'lookFrom',

			init : function(universe){
				this.root = $('#gui');
				this.selects = {};
			},

			addBtn : function(label, id, callback) {
				removeElement(id);
				elements[id] = $('<button id="'+id+'">'+label+'</button>').appendTo(getContainer(id)).on('click.orrery', callback);
			},
			
			exportValues : function(){
				var exportStr = JSON.stringify(exportingValues);
				return window.btoa(exportStr);
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

			addOption : function(selectName, label, val) {
				var sel = this.selects[selectName];
				if(!sel) return;

				var option = sel.options[val] = $('<li data-value="'+val+'">'+label+'</li>');
				option.on('click.orbit', sel.clickHandler);

				if(sel.list.children().length === 0) {
					sel.input.val(val);
					sel.display.html(label);
				}

				option.appendTo(sel.list);

				var defaultVal = this.defaultSettings && this.defaultSettings[selectName];
				if(defaultVal == val) {
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
					dateDisplay.datepicker({
						dateFormat : $.datepicker.ATOM,
						changeYear : true
					});
				}

				dateDisplay.off('change').on('change.orbit', function(){
					date = null;
					onChange();
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
				exportingValues[this.DATE_ID] = d;
				dateDisplay.val($.datepicker.formatDate( $.datepicker.ATOM, d));
			},

			getDate : function(){
				return date || dateDisplay.datepicker( "getDate" );
			},

			addSlider : function(id, onChange) {
				removeElement(id);
				var container = getContainer(id);
				var valDisplay = getLabel(id).find('.valDisplay').text('1x');

				var defaultVal = Number(this.defaultSettings[id]);

				var slider = $('<div>').appendTo(container).slider({
					slide : function(evt, ui){
						var val = ui.value;
						val = val < 1 ? 1 : val;
						exportingValues[id] = val;
						setSlideValue(val);
					},
					value : defaultVal || 1
				});

				elements[id] = slider;

				var setSlideValue = function(val){
					valDisplay.text(val+'x');
					onChange(val);
				};

				if(defaultVal) {
					this.pushDefaultsCallbacks(function(){
						setSlideValue(defaultVal)
					});
				}

				exportingValues[id] = defaultVal || 1;

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

			setDefaults : function(defaultSettings) {
				this.defaultSettings = defaultSettings;
			}
		};
	}
);