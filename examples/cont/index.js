const ControlMixin = bbmn.mixins.controls.control;
const InputMixin = bbmn.mixins.controls.input;
const View = Mn.CollectionView;

const InputControl = InputMixin(View);
const Control = ControlMixin(View);

const RangeControl = Control.extend({
	template: () => '<header>range</header><div></div>',
	childViewContainer: 'div',
	onRender(){
		this.addChildView(new InputControl({ proxyTo: this, controlName: 'from', valueType: 'number', required: true, }));
		this.addChildView(new InputControl({ proxyTo: this, controlName: 'to', valueType: 'number', required: true, }));
	},
});


const TestControl = Control.extend({
	template: () => '<header>big control</header><div></div><button>ok</button>',
	childViewContainer: 'div',
	validateOnReady: true,
	onRender(){
		this.addChildView(new RangeControl({ proxyTo: this, controlName: 'square' }))
		this.addChildView(new RangeControl({ proxyTo: this, controlName: 'price' }))
		this.on('control:invalid', this.disableButton);
		this.on('control:valid', this.enableButton);
		this.makeControlReady();
		console.log(3, this);
	},
	disableButton(){
		this.$('button').prop('disabled', true);
	},
	enableButton(){
		this.$('button').prop('disabled', false);
	}
});

$(() => {

	let test = new TestControl({ value: {} });
	test.$el.appendTo($('body'));
	//test.on('all', (...c) => console.log('> ',...c));
	test.render();


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
