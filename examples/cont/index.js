const ControlMixin = bbmn.mixins.controls.control;
const ControlViewMixin = bbmn.mixins.controls.controlView;
const InputMixin = bbmn.mixins.controls.input;
const ColView = Mn.CollectionView;
const View = Mn.View;
const validator = bbmn.components.validator;
const Control = ControlViewMixin(ColView);

const ModelSchemas = bbmn.components.ModelSchemas;
ModelSchemas.initialize('range', {
	from: {
		validation:{
			minValue:1,
			maxValue:5,
		}
	},
	to: {
		validation:{
			minValue:6,
			maxValue:10,
		}
	},
});

const InputControl = InputMixin(View).extend({
	controlValidate(value, allValues){
		let schema = this.getOption('schema');
		let rule = schema && schema.getValidation();
		return rule && validator.validate(value, rule, { allValues }) || undefined;
	},
	onControlChange(){
		let v1 = this.getControlValue();
		let v2 = this.getControlValue({ notValidated: true });
		console.log('Input change:', v1, v2);
	},
	onControlInvalid(){
		let v1 = this.getControlValue();
		let v2 = this.getControlValue({ notValidated: true });
		console.log('Input invalid:', v1, v2);
	},

});

const RangeControl = Control.extend({
	isControlWrapper: false,
	schema: ModelSchemas.get('range'),
	customs: v => ([
		v.buildInputView('from'),
		v.buildInputView('to'),
	]),
	buildInputView(key){
		let value = this.getControlValue(key);
		let schema = this.schema.getProperty(key);
		return new InputControl({
			attributes:{ placeholder: key }, 
			controlName: key, value, valueType : 'number',
			schema,
		})
	},
	onControlChange(){
		let v1 = this.getControlValue();
		let v2 = this.getControlValue({ notValidated: true });
		console.log('Range change:', v1, v2);
	},
	onControlInvalid(){
		let v1 = this.getControlValue();
		let v2 = this.getControlValue({ notValidated: true });
		console.log('Range invalid:', v1, v2);
	},

});


const TestControl = Control.extend({
	isControlWrapper: false,
	renderAllCustoms: true,
	header: 'Model editing',
	customs: v => ([
		new RangeControl({ header: 'Price', controlName: 'price', value: v.getControlValue('price') }),
		new RangeControl({ header: 'Square', controlName: 'square', value: v.getControlValue('square') })
	]),
	onControlChange(){
		let v1 = this.getControlValue();
		let v2 = this.getControlValue({ notValidated: true });
		console.log('test change:', v1, v2);
	},
	onControlInvalid(){
		let v1 = this.getControlValue();
		let v2 = this.getControlValue({ notValidated: true });
		console.log('test invalid:', v1, v2);
	},

});

$(() => {

	let test = new TestControl({ value: {} });
	test.$el.appendTo($('body'));
	//test.on('all', (...c) => console.log('> ',...c));
	test.render();

	console.log(test);

	// let promises = [];
	// for(let x = 0;x < 10;x++)
	// 	promises.push(promise(x));

	// Promise.all(promises).catch(() => {});

	// setTimeout(() => _.each(promises, promise => getPromiseState(promise)), 1500);
	

});


function stateRacePromise(promise) {
	const pending = {};
	return Promise.race([promise, pending]).then(
		value => (value === pending) ? 'pending' : 'fulfilled', 
		() => 'rejected'
	);
}

async function getPromiseState(promise){
	let state = await stateRacePromise(promise);
	console.log('>>', state, promise);
	return state;
}

function promise(arg){
	return new Promise((resolve, reject) => {
		let finalize = Math.random() * 2 >> 0 ? resolve : reject;
		let delay = Math.random() * 3000 >> 0;
		setTimeout(() => finalize(arg), delay);
	});	
}
