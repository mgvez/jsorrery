
define(
	[
		'orbit/NameSpace',
		'jquery',
		'ui',
		'_'
	],
	function(){
		var elements = {};

		var removeElement = function(elId){
			elements[elId] && elements[elId].remove();
		};

		return {
			init : function(universe){
				this.root = $('#gui');
				this.selects = {};
			},

			addBtn : function(label, id, callback) {
				removeElement(id);
				elements[id] = $('<button id="'+id+'">'+label+'</button>').appendTo(this.root).on('click.orrery', callback);
			},

			addDropdown : function(id, label, callback){
				removeElement(id);
				var labelEl = elements[id] = $('<label>'+label+'</label>').appendTo(this.root);
				this.selects[id] = {
					select : $('<select id="'+id+'">').appendTo(labelEl).on('change.orrery', callback),
					options : {}
				};
				return this.selects[id].select;
			},

			addOption : function(selectName, label, val) {
				this.selects[selectName].options[val] = $('<option value="'+val+'">'+label+'</option>').appendTo(this.selects[selectName].select);
			},

			toggleOptions : function(selectName, toToggle, isShow){
				var options = this.selects[selectName].options;
				var toggleFcn = isShow ? 'show' : 'hide';
				_.each(toToggle, function(optId){
					options[optId] && options[optId][toggleFcn]();
				});
			},

			addText : function(){
				return $('<div>').appendTo(this.root);
			},

			addSlider : function(id, onChange) {
				removeElement(id);
				var slider = $('<div>').appendTo(this.root).slider({
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