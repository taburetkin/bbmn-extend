import isKnownCtor from '../../../utils/is-known-ctor';

export default Base => Base.extend({

	constructor(opts){

		Base.apply(this, arguments);
		this._initializeChildrenable(opts);

	},
	_initializeChildrenable(opts){
		this.mergeOptions(opts, ['parent', 'root']);
		if(this.parent == null && this.root == null)
			this.root = this;
	},

	//call this method manualy for initialize children
	initializeChildren(){
		if (this._childrenInitialized) return;

		let children = this.getOption('children');
		this._children = [];
		_(children).each(child => this._initializeChild(child));

		this._childrenInitialized = true;

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

		//if (!isKnownCtor(arg)) return;

		_.extend(options, this.getOption('childOptions'), { parent: this });
		options = this.buildChildOptions(options);
		
		let child = this.buildChild(Child, options);
		this._children.push(child);

	},

	buildChildOptions(options){
		return options;
	},
	buildChild(Child, options){
		!Child && (Child = this.getOption('defaultChildClass') || this.prototype.constructor);
		return new Child(options);
	},
	getChildren(opts = {}){
		let children = this._children || [];
		let { reverse, clone } = opts;		
		if(!reverse && !clone)
			return children;

		let result = [].slice.call(children);
		if(reverse)
			result.reverse();

		return result;
	},
	getAllChildren(opts){
		let children = this.getChildren(opts);
		return _(children).chain()
			.map(child => [child.getAllChildren(opts), child])
			.flatten()
			.value();
	},
	getParent(){
		return this.parent;
	}



});
