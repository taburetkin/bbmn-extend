console.log('!!!!', bbmn);
$(() => {
	const Input = bbmn.mixins.controls.input(Mn.View).extend({
		initialize(){
			this.$el.appendTo($('body'));
			this.on('all', c => console.log(c));
			// this.$el.on('keydown', e => console.log('keydown:',e.target.value, this.getControlValue()));
			// this.$el.on('keypress', e => console.log('keypress:',e.target.value, this.getControlValue()));
			// this.$el.on('keyup', e => console.log('keyup:',e.target.value, this.getControlValue()));
			// this.$el.on('paste', e => console.log('paste:',e.target.value, this.getControlValue(), e));			
			// this.$el.on('input', e => console.log('input:',e.target.value, this.getControlValue()));
		},
	});
	var input = new Input({
		value:'',
		maxLength: 10,
		valueType:'number',
		inputType: 'text',
	});
	input.render();
	console.log(input);
});