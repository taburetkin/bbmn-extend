const ControlMixin = bbmn.mixins.controls.control;
const InputMixin = bbmn.mixins.controls.input;
const View = Mn.View;

const InputControl = InputMixin(View);
const Control = ControlMixin(View);

const TestControl = Control.extend({
	template: () => '<header>header</header><div></div>',
	childViewEventPrefix: 'child',
	regions:{
		'control':'div'
	},
	onRender(){
		let view = new InputControl({
			proxyTo: this
		});
		this.showChildView('control', view);
	},
	validateControl(){
		return 'error';
	},
	childControlEvents:{
		'control:change'(value){
			this.setControlValue(value);
		}
	}
});

$(() => {

	let test = new TestControl();
	test.$el.appendTo($('body'));
	test.on('all', c => console.log('> ',c));
	test.render();

});
