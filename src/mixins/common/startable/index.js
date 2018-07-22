import Process from '../../../components/process';


const defaultStartableOptions  = {
	concurrent: false,

	//good place to supply own state collecting logic
	storeState(){

		this.contextState = [{
			key: 'startable.status',
			value: this.context['startable.status']
		}];


		/*

		for example: take all simple values from context

		for(var key in this.context){
			let value = this.context[key];
			if (value == null || !_.isObject(value.valueOf()))
				this.contextState.push({ key, value });
		}

		*/

	},
	restoreState(){
		_(this.contextState || []).each(keyValue => {
			this.context[keyValue.key] = keyValue.value;
		});
	},
	onBegin(){
		this.storeState();
		this.ensureState();
		this.context['startable.status'] = this.processingName;
	},
	onComplete(){
		this.context['startable.status'] = this.processedName;
	},	
	onError(){
		this.restoreState();
	},
	ensureState(shouldThrow = true){
		let other = this.name == 'start' ? 'stop' : 'start';
		let error = this.name == 'start' ? 'not:stopped' : 'not:started';
		let status = this.context['startable.status'];
		switch(status){
		case 'stopping':
		case 'starting':
			if(shouldThrow) throw new Error('not:iddle');
			else return 'not:iddle';
		case 'iddle':
			if(this.name == 'start') return;
			else if(shouldThrow) throw new Error(error);
			else return error;
		case other:
			if(shouldThrow) throw new Error(error);
			else return error;			
		}
	}
};

const defaultStartOptions  = {
	processingName: 'starting',
	processedName: 'started'
};
const defaultStopOptions  = {
	processingName: 'stopping',
	processedName: 'stopped'
};

export default Base => Base.extend({
	constructor(){

		Base.apply(this, arguments);
		this._initializeStartable();

	},
	'startable.status': 'iddle',
	_initializeStartable(){

		let startable = _.extend({}, defaultStartableOptions, this.getOption('startableOptions', {args:[this]}));

		let start = _.extend({}, startable, defaultStartOptions, this.getOption('startOptions', {args:[this]}));
		let stop = _.extend({}, startable, defaultStopOptions, this.getOption('stopOptions', {args:[this]}));

		Process.register(this, 'start', start);
		Process.register(this, 'stop', stop);

	},

}, {
	Startable: true
});
