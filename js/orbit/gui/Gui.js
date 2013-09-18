
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

		var listClicked = function(selector, clickedOption, input){
			
			selector.display.html(clickedOption.html());
			input.val(clickedOption.data('value')).trigger('change');

		};


		return {
			init : function(universe){
				this.root = $('#gui');
				this.selects = {};
			},

			addBtn : function(label, id, callback) {
				removeElement(id);
				elements[id] = $('<button id="'+id+'">'+label+'</button>').appendTo(getContainer(id)).on('click.orrery', callback);
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
					listClicked(selector, $(this), input);
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

			addDate : function(){
				if(!this.dateDisplay) {
					this.dateDisplay = $('<input>').appendTo(getContainer('date'));
					this.dateDisplay.datepicker({
						dateFormat : $.datepicker.ATOM,
						changeYear : true
					});
				}
				return this.dateDisplay;
			},

			setDate : function(d){
				this.dateDisplay.val($.datepicker.formatDate( $.datepicker.ATOM, d));
			},

			getDate : function(d){
				return this.dateDisplay.datepicker( "getDate" );
			},

			addSlider : function(id, label, onChange) {
				removeElement(id);
				var container = getContainer(id);
				var valDisplay = getLabel(id).find('.valDisplay').text('1x');
				var slider = $('<div>').appendTo(container).slider({
					slide : function(evt, ui){
						var val = ui.value;
						val = val < 1 ? 1 : val;
						valDisplay.text(val+'x');
						onChange(val);
					}
				});
				elements[id] = slider;
				return slider;
			},

			remove : function(id){
				removeElement(id);
			}
		};
	}
);