
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

		var listClicked = function(list, clickedOption, input){
			var isOpen = list.data('open');
			var options = list.data('options');
			if(!options){
				options = list.find('li');
				list.data('options', options);
			}

			if(!isOpen) {
				options.show();
				list.addClass('open');
			} else {
				if(clickedOption.hasClass('disabled')) return;
				list.removeClass('open');
				options.hide();
				options.removeClass('selected');
				clickedOption.show();
				clickedOption.addClass('selected');
				input.val(clickedOption.data('value')).trigger('change');
			}

			list.data('open', !isOpen);
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
				this.selects[id] = {
					input : $('<input id="'+id+'_inp">').on('change.orrery', callback),
					list : $('<ul id="'+id+'" data-open="false">').appendTo(getContainer(id)),
					options : {}
				};
				var list = elements[id] = this.selects[id].list;
				var input = this.selects[id].input;

				this.selects[id].clickHandler = function(e){
					listClicked(list, $(this), input);
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
					option.addClass('selected');
				} else {
					option.hide();
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
				this.dateDisplay = $('<input>').appendTo(getContainer('date'));
				this.dateDisplay.datepicker({
					dateFormat : $.datepicker.ATOM
				});
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
				var slider = $('<div>').appendTo(getContainer(id)).slider({
					slide : function(evt, ui){
						onChange(ui.value);
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