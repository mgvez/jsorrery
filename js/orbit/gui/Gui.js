
define(
	[
		'orbit/NameSpace',
		'jquery',
		'ui',
		'_'
	],
	function(){

		return {
			init : function(universe){
				this.root = $('#gui');
				this.selects = {};
			},

			addBtn : function(label, elClass, callback) {
				$('<button class="'+elClass+'">'+label+'</button>').appendTo(this.root).on('click.orrery', callback);
			},
			
			addDropdown : function(name, label, callback){
				var labelEl = $('<label>'+label+'</label>').appendTo(this.root);
				this.selects[name] = {
					select : $('<select id="'+name+'">').appendTo(labelEl).on('change.orrery', callback),
					options : {}
				};
				
				return this.selects[name].select;
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

			addSlider : function(onChange) {
				var slider = $('<div>').appendTo(this.root).slider({
					slide : function(evt, ui){
						onChange(ui.value);
					}
				});
				return slider;
			}
		};
	}
);