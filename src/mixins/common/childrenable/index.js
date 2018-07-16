import isKnownCtor from '../../../utils';

export default Base => Base.extend({

	constructor(){

		Base.apply(this, arguments);
		
		//if(this.getOption('autoinitialization'))
		this.initializeChildren();

	},

	_initializeChildren(){
		
		this.triggerMethod('before:children:initialize');

		let children = this.getOption('children');
		this._children = [];
		_(children).each(child => this._initializeChild(child));
	},
	_initializeChild(arg){
		let Child;
		let options = {};

		if (isKnownCtor(arg))
			Child = arg;
		else if(_.isFunction(arg)){
			
			let invoked = arg.call(this, this);
			return this._initializeChild(invoked);

		} else if (_.isObject(arg)) {
			Child = arg.Child;
			_.extend(options, _.omit(arg, 'Child'));
		}

		if (!isKnownCtor(arg)) return;

		_.extend(options, this.getOption('childOptions'), { parent: this });
		options = this.buildChildOptions(options);
		
		let child = new Child(options);
		this._children.push(child);

	}

});
