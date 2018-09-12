//import isKnownCtor from '../../../utils/is-known-ctor';
import { isKnownCtor } from '../../../utils/index.js';
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
	_getChildren(items, opts = {}){
		let { exclude, filter, map } = opts;

		if(exclude != null && !_.isArray(exclude))
			opts.exclude = [exclude];

		if(!_.isFunction(filter))
			delete opts.filter;

		let result = [];
		_(items).each((item, index) => {

			if(!this._childFilter(item, index, opts))
				return;

			if(_.isFunction(map))
				item = map(item);

			item && result.push(item);
		});
		return result;
	},
	_childFilter(item, index, opts = {}){
		
		if(opts.force) return item;

		let { exclude, filter } = opts;

		if(_.isFunction(this.childFilter) && !this.childFilter(item, index, opts))
			return;

		if(_.isArray(exclude) && exclude.indexOf(item) >= 0)
			return;

		if(_.isFunction(filter) && !filter.call(this, item, index, opts))
			return;

		return item;
	},
	childFilter: false,
	getChildren(opts = {}){
		let children = [].slice.call(this._children || []);
		opts.reverse && children.length > 1 && children.reverse();		
		return this._getChildren(children, opts);
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



}, { ChildrenableMixin: true });
