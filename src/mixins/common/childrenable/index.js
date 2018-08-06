import isKnownCtor from '../../../utils/is-known-ctor';

export default Base => Base.extend({

	constructor(opts){

		Base.apply(this, arguments);
		this._initializeChildrenable(opts);

	},
	_initializeChildrenable(opts){
		this.mergeOptions(opts, ['parent', 'root']);
		if (this.parent == null && this.root == null) 
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
	_prepareChildren(items, opts = {}){
		let { exclude, filter, map } = opts;

		if(exclude != null && !_.isArray(exclude))
			exclude = [exclude];

		if(filter != null && !_.isFunction(filter))
			filter = null;

		if(!(exclude || filter || map))
			return items;


		let result = [];
		_(items).each(item => {

			if(exclude && exclude.indexOf(item) >= 0)
				return;

			if(filter && !filter(item))
				return;

			if(_.isFunction(map))
				item = map(item);

			item && result.push(item);
		});
		return result;
	},
	getChildren(opts = {}){

		let children = this._children || [];
		let { reverse, clone } = opts;
		if(reverse || clone) {
			children = [].slice.call(children);
			if(reverse) children.reverse();
		}
		return this._prepareChildren(children, opts);
	},
	getAllChildren(opts = {}){

		let { includeSelf, map, reverse } = opts;
		let options = _.omit(opts, 'includeSelf', 'map');


		let children = this.getChildren(options);
		let result = _(children).chain()
			.map(child => {
				let children = child.getAllChildren(options);
				return reverse ? [children, child] : [child, children];
			})
			.flatten()
			.value();

		if (includeSelf) {
			let method = reverse ? 'push' : 'unshift';
			result[method](this);
		}
		
		if (_.isFunction(map)) {
			return _(result).chain().map(map).filter(f => !!f).value();
		} else {			
			return result;
		}

	},

	getParent(){
		return this.parent;
	}



});
