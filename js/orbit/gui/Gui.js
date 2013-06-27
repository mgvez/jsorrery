
define(
	[
		'orbit/NameSpace',
		'jquery',
		'ui'
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
				this.selects[name] = $('<select id="'+name+'">').appendTo(labelEl).on('change.orrery', callback);
				return this.selects[name];
			},
			addOption : function(selectName, label, val) {
				$('<option value="'+val+'">'+label+'</option>').appendTo(this.selects[selectName]);
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