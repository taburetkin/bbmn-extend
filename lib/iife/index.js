var bbmn = (function (exports,Backbone,Mn) {
'use strict';

var Backbone__default = 'default' in Backbone ? Backbone['default'] : Backbone;
var Mn__default = 'default' in Mn ? Mn['default'] : Mn;

const MnObject = Mn__default.Object || Mn__default.MnObject;

var defaultOptions = {
	mergeObjects: true,
	wrapObjectWithConstructor: true,
};

function createMixinFromObject(arg) {
	let mixedObj = _.clone(arg);
	let mixedCtor = _.isFunction(mixedObj.constructor) && mixedObj.constructor;
	return Base => { 
		if (_.isFunction(mixedCtor)) {
			//let providedCtor = ((mixed) => mixed)(obj.constructor);
			mixedObj.constructor = function mx(){
				Base.apply(this, arguments);
				mixedCtor.apply(this, arguments);
			};
		}
		return Base.extend(mixedObj);
	};
}

function normalizeArguments(args, opts = {}) {
	let raw = {};
	let wrap = opts.wrapObjectWithConstructor == true;
	let merge = opts.mergeObjects == true;
	let mixins = [];
	_(args).each(arg => {
		
		//if argument is function just put it to mixins array
		//and continue;
		if (_.isFunction(arg)) {
			mixins.push(arg);
			return;
		}

		//if argument is not an object just skip it
		if (!_.isObject(arg)) return;

		//if mergeObjects == false or wrapObjectWithConstructor == true 
		//and there is a constructor function
		//converting to a mixin function
		//otherwise extend rawObject
		if (!merge || (wrap && _.isFunction(arg.constructor))) {
			mixins.push(createMixinFromObject(arg));
		} 
		else {
			_.extend(raw, arg);
		}
	
	});

	//if rawObject is not empty
	//convert it to a mixin function
	//and put it to the begin of mixins array
	if (_.size(raw))
		mixins.unshift(createMixinFromObject(raw));

	return mixins;
}

function withMethod(...args) {

	let mixins = normalizeArguments(args, this.options);
	let Mixed = this.class;
	if (!mixins.length) return Mixed;
	else
		return _.reduce(mixins, (Memo, Ctor) => { 
			let mixed = Ctor(Memo);
			return mixed;
		}, Mixed);

}

function isClass(arg, Base){
	return _.isFunction(arg) && (arg == Base || arg.prototype instanceof Base);
}


function isModel(arg){
	return arg instanceof Backbone.Model;
}
function isModelClass(arg) {
	return isClass(arg, Backbone.Model);
}


function isCollection(arg){
	return arg instanceof Backbone.Collection;
}
function isCollectionClass(arg) {
	return isClass(arg, Backbone.Collection);
}


function isView(arg){
	return arg instanceof Backbone.View;
}


function isViewClass(arg) {
	return isClass(arg, Backbone.View);
}

const extend = Backbone.Model.extend;

function mix(_ctor, options) {

	let opts = _.extend({}, defaultOptions, options);

	let ctor;

	if (_.isFunction(_ctor)) {
		ctor = _ctor;
	}
	else if (_.isObject(_ctor)) {
		let b = _.isFunction(_ctor.constructor) && _ctor.constructor;
		ctor = function mx() { b.apply(this, arguments); };
		_.extend(ctor.prototype, _.omit(_ctor,'constructor'));

	} else {
		throw new Error('Mix argument should be a class or a plain object');
	}

	if (!_.isFunction(ctor.extend))
		ctor.extend = extend;

	return {
		options: opts,
		with: withMethod,
		class: ctor,
	};
}

const BaseModel = mix(function BbmnBase(){}).class;

let ctors = [
	Backbone.Model,
	Backbone.Collection,
	Backbone.View,
	Backbone.Router,
	MnObject,
	BaseModel
];

let tryGetFromMn = ['Region', 'Application', 'AppRouter'];

_.each(tryGetFromMn, ClassName => {
	_.isFunction(Mn__default[ClassName]) && ctors.push(Mn__default[ClassName]);
});

function isKnownCtor(arg) {
	let isFn = _.isFunction(arg);
	let result = _(ctors).some((ctor) => arg === ctor || arg.prototype instanceof ctor);
	return isFn && result;
}

function betterResult(obj, key, opts = {})
{
	let { context, args, checkAlso, force } = opts;
	let defaultValue = opts.default;

	if(!_.isString(key) || key === '') return;
	
	let value = (obj || {})[key];

	if (value != null && (!_.isFunction(value) || isKnownCtor(value)))
		return value;
		
	let result = force !== false && _.isFunction(value) ? value.apply(context || obj, args) : value;

	if (result == null && _.isObject(checkAlso)) {
		let alsoOptions = _.omit(opts, 'checkAlso');
		result = betterResult(checkAlso, key, alsoOptions);
	}

	if (result == null && defaultValue != null )
		result = defaultValue;

	return result;
}

function getOption(context = {}, key, opts, also) {

	if(_.isObject(key) && _.isString(opts)){
		let _opts = also;
		also = key;
		key = opts;
		opts = _opts;
	}

	let options = _.extend({ args:[context], context }, opts, { default: null });
	let { deep } = options;
	let defaultValue = opts && opts.default;

	let value = betterResult(context.options || also, key, options);
	if (value == null && deep !== false) {
		value = betterResult(context, key, options);
	}
	
	return value != null ? value : defaultValue;

}

function instanceGetOption(...args){
	return getOption(this, ...args);
}

const Mixin = Base => Base.extend({

	//property first approach
	getProperty(key, opts){
		
		let defaultGetArguments = betterResult(this, '_getPropertyArguments', { args:[this], default:[this] });
		let options = _.extend({
			deep: Mixin.defaults.deep,
			force: Mixin.defaults.force,
			args: defaultGetArguments
		}, opts, {
			context: this,
		});
		let { deep } = options;

		let value = betterResult(this, key, options);
		if (value == null && deep !== false) {
			value = betterResult(this.options, key, options);
		}
		return value;
	},

	//options first approach
	getOption(key, opts){
		let defaultGetArguments = betterResult(this, '_getOptionArguments', { args:[this], default:[this] });
		let options = _.extend({
			deep: Mixin.defaults.deep,
			force: Mixin.defaults.force,
			args: defaultGetArguments
		}, opts);

		return getOption(this, key, options);
	},

	mergeOptions(values = {}, keys = [], opts = {}){
		
		if(_.isString(keys))
			keys = keys.split(/\s*,\s*/);

		_.each(keys, (key) => {
			const option = betterResult(values, key, _.extend({ force: false }, opts));
			if (option !== undefined) {
				this[key] = option;
			}
		});

	}

}, {
	GetOptionMixin:true
});

Mixin.defaults = {
	deep: true,
	force: true
};

// camelCase('asd:qwe:zxc') -> asdQweZxc
// camelCase('asd:qwe:zxc', true) -> AsdQweZxc
function camelCase(...args) {
	
	let text;
	let first;

	if (!args.length) return;
	else if (args.length == 1) {
		text = args[0];
	} else {
		if(_.isBoolean(args[args.length - 1])){
			first = args.pop();
		}
		text = _.filter(args, chunk => chunk != null).join(':');
	}

	if (!text) return text;

	if (!_.isString(text)) return text.toString();
	text = text.replace(/:{2,}/gmi,':');
	var splitter = first === true ? /(^|:)(\w)/gi : /(:)(\w)/gi;
	text = text.replace(splitter, (match, prefix, text) => text.toUpperCase());
	if(!first)
		text = text.replace(/(^)(\w)/gi, (match, prefix, text) => text.toLowerCase());
	return text;

}

function triggerMethod(event, ...args) {
	// get the method name from the event name
	const methodName = camelCase('on:' + event);
	const method = getOption(this, methodName, { force: false });
	let result;
  
	// call the onMethodName if it exists
	if (_.isFunction(method)) {
		// pass all args, except the event name
		result = method.apply(this, args);
	}
  
	if(_.isFunction(this.trigger)) {
		// trigger the event
		this.trigger.apply(this, arguments);
	}
  
	return result;
}

function triggerMethodOn(context, event, ...args) {
	return triggerMethod.call(context, event, ...args);
}

function register (Process, context, name, opts) {

	context[name] = function(...args){
		
		let process = new Process(context, name, _.extend({}, opts));
		let concurrent = process.concurrencyCheck();

		if (concurrent)
			return concurrent;
		else
			return process.run(...args);

	};

}

function isPromisable(arg){
	return arg instanceof Promise || _.isFunction(arg && arg.then);
}

function asArray(arg) {
	if(_.isArray(arg))
		return arg;
	else if(arg == null || arg === '')
		return [];
	else
		return [arg];
}

function race(...promises){
	return Promise.race(promises);
}

function valueToPromise(arg){
	if(!isPromisable(arg)) {
		let result = arg;
		arg = arg == null || arg === '' ? Promise.resolve() : Promise.reject(result);
	}
	return arg;		
}

const Process = mix({
	constructor: function Process(context, name, opts){
		this._initDefaults(name, context);
		this._initCancelation();
		this._mergeOptions(opts);
	},


	// initialize methods

	_initDefaults(name, context){
		if(name == null || name === '')
			throw new Error('Process requires two arguments: name [string], context [object]. name missing');
		
		if(!_.isObject(context))
			throw new Error('Process requires two arguments: name [string], context [object]. context is not an object');

		this.cid = _.uniqueId('process');
		this.name = name;
		this.context = context;
		this.errors = [];
	},

	_initCancelation(){
		this.cancelPromise = new Promise((resolve, reject) => {
			this.cancel = () => reject('cancel'); 
		});
	},
	_mergeOptions(opts = {}){
		let options = _.omit(opts, 'cid', 'name', 'context', 'cancelPromise', 'cancel', 'errors');
		_(options).each((value, key) => this[key] = value);
	},

	
	concurrencyCheck(){

		let previous = this.getProcessFromContext();
		//console.log(previous, this.context);
		if(!previous) return;
	
		let concurrent = this.concurrent;	
		
		if (concurrent === false) {
	
			this.cancel();
	
		} else if (concurrent == 'first') {
	
			return previous.promise;
	
		} else if (concurrent == 'last') {
	
			previous.cancel();
	
		}		
	},


	// life cycle methods	

	run(...args){
		this.updateProcessInContext(this);
		this.args = args || [];
		this.promise = this._createLifeCyclePromise();
		return this.promise;
	},


	_createLifeCyclePromise(){


		return this._notCanceled()
			.then(() => this._begin())
			.then(() => this._beforeStart())
			.then(() => this._canBeStarted())
			.then(() => this._waitOtherPromises())
			.then(() => {
				this.triggerComplete();
				return Promise.resolve();
			})
			.catch(error => {
				this.triggerError(error);
				let jsError;
				if(error instanceof Error) {
					throw error;
				} else if ((jsError = this.getJsError())) {
					throw jsError;
				} else {
					return Promise.reject(this);
				}
			});		
	},




	_notCanceled() {
		return this._cancelationRace(Promise.resolve());
	},
	_begin(){
		return this._getHookResultAsPromise('begin');
	},
	_beforeStart(){
		return this._getHookResultAsPromise('before');
	},
	_canBeStarted(){
		let contextMethod = 'can:not:' + this.name;
		let promise = this.invokeOnContext(contextMethod);
		if(!isPromisable(promise)) {
			promise = (promise == null || promise === '') 
				? Promise.resolve()
				: Promise.reject(promise);
		}
		return this._cancelationRace(promise);
	},
	_waitOtherPromises(){
		let contextMethod = `get:${this.name}:promises`;
		
		let promises = asArray(this.invokeOnContext(contextMethod));

		return this._cancelationRace(Promise.all(promises));
	},

	_getHookResultAsPromise(hookName){
		let procMethod = camelCase('on:' + hookName);
		let procHook = _.isFunction(this[procMethod]) && this[procMethod](this.context, ...this.args) || undefined;
		let result = valueToPromise(procHook).then(() => {
			let cntxHook = this.triggerOnContext(hookName);
			return valueToPromise(cntxHook);
		});

		return this._cancelationRace(result);

	},

	// trigger methods

	triggerComplete() { 

		this.updateProcessInContext(null);

		if (_.isFunction(this.onComplete))
			this.onComplete(this.context, ...this.args);

		this.triggerOnContext();

		this.triggerEnd();
		
	
	},
	triggerError(errors){


		this.updateProcessInContext(null);		

		if(!_.isArray(errors))
			errors = [errors];

		this.errors.push(...errors);

		
		if (_.isFunction(this.onError))
			this.onError(this.context, ...this.errors);
		
		this.triggerOnContext('error', ...this.errors);
		
		this.triggerEnd();

		
	},
	triggerEnd(){
		this.triggerOnContext('end');
	},



	// helpers methods

	getJsError(context){
		!context && (context = this);
		if(context != this && (!_.isObject(context) || !_.isArray(context.errors)))
			return;

		return _(context.errors).filter(f => f instanceof Error)[0];
	},	

	_cancelationRace(promise){
		return race(this.cancelPromise, promise);
	},


	getContextProcessKey(){
		return camelCase(`_process:${this.name}:executing`);
	},
	getProcessFromContext(){
		let key = this.getContextProcessKey();
		return this.context[key];
	},
	updateProcessInContext(process){
		let key = this.getContextProcessKey();		
		this.context[key] = process;
	},



	triggerOnContext (eventName) {
	
		let context = this.context; 
		if(!_.isFunction(context.trigger))
			return;
		
		let event = (eventName ? eventName + ':' : '') + this.name;
		
		return triggerMethodOn(context, event, this, ...this.args);
	
	},

	invokeOnContext(methodName)
	{
		let method = camelCase(methodName);
		let context = this.context;
		let args = this.args;
		return betterResult(context, method, { args });

	}

}).class;


Process.register = function(context, name, opts) {
	return register(this, context, name, opts);
};

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
	onBefore(...args){
		this.storeState();
		this.ensureState();
		this.context['startable.status'] = this.processingName;
		this.context['startable.start.lastArguments'] = args;
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

var StartableMixin = Base => Base.extend({
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
	isStarted(){
		return this['startable.status'] === 'started';
	},
	isStopped(){
		return this['startable.status'] === 'stopped' || this['startable.status'] === 'iddle';
	},
	isNotIddle(){
		return this['startable.status'] === 'stopping' || this['startable.status'] === 'starting';
	},
	restart(){
		if(this.isNotIddle())
			throw new Error('Restart not allowed while startable instance is not iddle: ', this['startable.status']);
		let stop = this.isStarted() ? this.stop() : Promise.resolve();
		let args = this['startable.start.lastArguments'] || [];
		return stop.then(() => this.start(...args));
	}
}, {
	StartableMixin: true
});

var ChildrenableMixin = Base => Base.extend({

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



var index = Object.freeze({
	getOption: Mixin,
	startable: StartableMixin,
	childrenable: ChildrenableMixin
});

function getNestedResult(value, context, schema) {
	return value != null 
		&& _.isFunction(schema.nested) 
		&& schema.nested(value, context);
}

function getPropertySchema(model, key)
{
	if (_.isFunction(model.getPropertySchema)) {
		return model.getPropertySchema(key);
	} else {
		return {};
	}
}

function getDisplayConfig(key, model, schema){
	if (key == null) return {};
	return (_.isFunction(model.getPropertyDisplayConfig) && model.getPropertyDisplayConfig(key))
		|| (schema && schema.display) || {};
}

function getProperty(context, name)
{
	if(context == null || !_.isObject(context) || name == null || name == '') return;
	if (isModel(context))
		return context.get(name, { gettingByPath: true  });
	else
		return context[name];
}

function getByPathArray(context, propertyName, pathArray) {
	
	if (context == null || !_.isObject(context) || propertyName == null || propertyName == '')
		return;

	var prop = getProperty(context, propertyName);

	if (!pathArray.length || (pathArray.length && prop == null))
		return prop;

	var nextName = pathArray.shift();

	return getByPathArray(prop, nextName, pathArray);

}

function getByPath(obj, path) {

	if (obj == null || !_.isObject(obj) || path == null || path == '') return;

	var pathArray = _.isString(path) ? path.split('.')
		: _.isArray(path) ? [].slice.call(path)
			: [path];

	var prop = pathArray.shift();

	return getByPathArray(obj, prop, pathArray);

}

var index$1 = Base => {
	const originalGet = Backbone.Model.prototype.get;
	const Mixed = Base.extend({
		getByPath(key){
			if(key.indexOf('.') > -1)
				return getByPath(this, key);
			else
				return originalGet.call(this, key);
		},
		get(key, opts = {}){
			if(key == null || key == '') return;	
			
			let value = 'value' in opts 
				? opts.value
				: this.getByPath.call(this, key);

			if (!_.size(opts)) {
				return value;
			}

			let prop = getPropertySchema(this, key);
			let result = opts.nested && getNestedResult(value, this, prop);
			if (result != null) {
				return result;
			}

			if(_.isFunction(opts.transform) && !opts.raw) {
				value = opts.transform.call(this, value, opts, this);
			}

			if(_.isFunction(prop.transform) && !opts.raw){
				value = prop.transform.call(this, value, opts, this);
			}

			if(opts.display === true){

				let display = getDisplayConfig(key, this, prop);

				if(opts.alternative){
					value = _.isFunction(display.alternative) && display.alternative.call(this, value, _.extend({},opts,prop), this);
				}
				else if(_.isFunction(display.transform)) {
					value = display.transform.call(this, value, opts, this);
				}
				if(display.ifEmpty && (value == null || value === ''))
					return display.ifEmpty;
			}

			return value;
		},
		display(key, opts = {}){
			_.extend(opts, { display:true });
			return this.get(key, opts);
		},
		propertyName(key) {
			let prop = getPropertySchema(this, key);
			let display = getDisplayConfig(key, this, prop);
			return display.label || key;
		}
	});

	return Mixed;
};



var index$2 = Object.freeze({
	smartGet: index$1
});

var index$3 = Collection$$1 => Collection$$1.extend({
	constructor(){
		
		this.on({
			request(){
				this._isFetching = true;
			},
			sync(){
				this._isFetching = false;
				this._isFetched = true;
			}
		});
		
		Collection$$1.apply(this, arguments);
	},
	isFetching(){
		return this._isFetching === true;
	},
	isFetched(){
		return this._isFetched === true;
	}
});



var index$4 = Object.freeze({
	isFetching: index$3
});

const defaultCssConfig = {
	beforeRender: true,
	modelChange: true,
	refresh: true,
};

var cssClassModifiers = (Base) => Base.extend({
	constructor(){
		if(!this.cssClassModifiers) {
			this.cssClassModifiers = [];
		}
		Base.apply(this, arguments);
		this._setupCssClassModifiers();		
	},
	addCssClassModifier(...modifiers){
		this.cssClassModifiers.push(...modifiers);
	},
	refreshCssClass(){
		let className = this._getCssClassString();
		if(className == ''){
			this.$el.removeAttr('class');
		}
		else {
			this.$el.attr({
				class: className
			});
		}
	},	

	_getCssClassModifiers(){
		let optsModifiers = betterResult(this.options || {}, 'cssClassModifiers', { args:[this.model, this], default: [] });
		let propsModifiers = betterResult(this, 'cssClassModifiers', { args:[this.model, this], default: [] });
		let className = betterResult(this, 'className', { args:[this.model, this], default: [] });
		let modifiers = [className].concat(optsModifiers, propsModifiers);
		return modifiers;
	},
	//override this if you need other logic
	getCssClassModifiers(){
		return this._getCssClassModifiers();
	},
	_getCssClassString()
	{
		let modifiers = this.getCssClassModifiers();
		
		let classes = _(modifiers).reduce((hash, modifier) => {
			if(modifier == null || modifier === '') { return hash; }
			let cls;
			if (_.isString(modifier)) {
				cls = modifier;
			} else if (_.isFunction(modifier)) {
				let builded = modifier.call(this, this.model, this);
				cls = _.isString(builded) && builded || undefined;
			}
			cls && (hash[cls] = true);
			return hash;
		}, {});

		return _.keys(classes).join(' ');

		// return _.chain(classes)
		// 	.keys(classes)
		// 	.uniq()
		// 	.value()
		// 	.join(' ');

	},

	_setupCssClassModifiers(){

		if(this._cssClassModifiersInitialized) return;

		let cfg = this.getCssClassConfig();
		if(!cfg) return;

		let events = this.getCssClassEvents(cfg);
		_(events).each((eventName) => this.on(eventName, this.refreshCssClass));

		if (cfg.modelChange && this.model) {
			this.listenTo(this.model, 'change', this.refreshCssClass);
		}

		this._cssClassModifiersInitialized = true;
	},
	
	_getCssClassConfig(){
		let cfg = _.extend({}, defaultCssConfig, this.getOption('cssClassConfig'));
		if(!cfg || _.size(cfg) == 0) return;
		return cfg;
	},
	//override this if you need other logic
	getCssClassConfig(){
		return this._getCssClassConfig();
	},

	_getCssClassEvents(cfg){
		let events = [].concat(cfg.events || []);
		if(cfg.refresh) events.push('refresh');
		if(cfg.beforeRender) events.push('before:render');
		events = _(events).uniq();
		return events;
	},
	//override this if you need other logic
	getCssClassEvents(cfg){
		return this._getCssClassEvents(cfg);
	}
}, { CssClassModifiersMixin: true });

function takeFirst(key, ...args) {
	if(!_.isString(key) || key === '') return;
	let value;
	_.some(args, arg => {
		if (key in (arg || {})) {
			value = arg[key];
			return true;
		}
	});
	return value;
}

function getModel(arg){

	if (isModel(arg)) { return arg; }
	
	if (isView(arg)) { return arg.model; }

}

function getModel$1(arg){
	return isView(arg) && arg;
}

function compareAB(a, b, func){
	if(_.isArray(func)) {

		let result = 0;

		_(func).every((f) => {
			result = compareAB(a,b,f);
			return result === 0;
		});
		
		return result;
	} else {
		if (_.isFunction(func)) {
			a = func.call(a, getModel(a), getModel$1(a));
			b = func.call(b, getModel(b), getModel$1(b));
		}

		if (a < b) return -1;
		if (a > b) return 1;
		return 0;

	}
}

function comparator(...args){
	var result = 0;

	//for simple case (arg1, arg2, compare)
	if (args.length <= 3 && !_.isArray(args[0])){

		return compareAB.apply(null, args);

	} 
	//for complex cases ([arg1, arg2, compare], [], .... [])
	//each arguments should be an array
	else {

		_(args).every((single) => {

			if(!_.isArray(single)) return true;
			result = compareAB(...single);
			return result === 0;
		});

	}

	return result;
}

function toNumber(text){
	if(_.isNumber(text)) return text;
	if(!_.isString(text)) return;
	
	let value = parseFloat(text, 10);
	if(isNaN(value))
		value = undefined;
		
	return value;
}

var defaultOptions$1 = {
	nullable: true, 
	strict: false,
	returnNullAs: undefined, 
	returnEmptyAs: undefined, 
	returnNullAndEmptyAs: undefined,
	returnAnyAs: undefined, 
	returnOtherAs: undefined
};

const trueValues = ['true','1','-1','yes'];
const falseValues = ['false','0','no'];

const alternative = function(...args) {
	let returnValue;
	_(args).some(arg => {
		if(_.isBoolean(arg)) {
			returnValue = arg;
			return true;
		}
	});
	return returnValue;
};

const valueOrAlternative = function(nullable, nullValue, value, ...alts){
	let alt = alternative(...alts);
	if (alt != null)
		return alt;
	else if (nullable)
		return nullValue;
	else
		return value;
};

const convertToBoolean = function (arg, opts = {})
{

	let other;
	let options = _.extend({}, defaultOptions$1, opts);
	let { 
		nullable, strict,
		returnNullAs, returnEmptyAs, returnNullAndEmptyAs,
		returnAnyAs, returnOtherAs
	} = options;



	if (arg == null) {
		return valueOrAlternative(nullable, undefined, false, returnNullAs, returnNullAndEmptyAs);
	}
	else if (arg === '') {
		return valueOrAlternative(nullable, undefined, false, returnEmptyAs, returnNullAndEmptyAs);
	} else if (_.isBoolean(arg)) {
		return arg;
	}
	//  else if (_.isObject(arg)) {
	// }
	
	other = strict 
		? (nullable ? undefined : false) 
		: true;
		

	let text = arg.toString().toLowerCase();
	let isTrue = convertToBoolean.trueValues.indexOf(text) > -1;
	let isFalse = convertToBoolean.falseValues.indexOf(text) > -1;


	if (_.isBoolean(returnAnyAs)) {
		return returnAnyAs;
	} else if (_.isBoolean(returnOtherAs)) {
		other = returnOtherAs;
	}
	
	return isTrue 
		? true 
		: isFalse 
			? false 
			: other;
};

convertToBoolean.trueValues = trueValues;
convertToBoolean.falseValues = falseValues;

//this is under development yet and can be change in any time
function convertString(text, type, opts) {

	switch(type){
	case 'number':
		return toNumber(text, opts);
	case 'boolean':
		return convertToBoolean(text, opts);
	default:
		return text;
	}


}

function traverse(fields, root)
{
	root = root || '';
	if (this == null || typeof this != 'object') {
		return;
	}

	var hash = isModel(this) ? this.attributes : this;

	var props = Object.getOwnPropertyNames(hash);

	for (var x = 0; x < props.length; x++) {
		var name = props[x];
		var prop = this[name];

		if (prop == null || typeof prop != 'object' || (prop instanceof Date || prop instanceof Array)) {

			fields[root + name] = prop;
		}
		else if (typeof prop == 'object') {

			traverse.call(prop, fields, root + name + '.');
		}
	}
		
}

function flattenObject(obj) {
	if (obj == null || !_.isObject(obj)) return;
	var res = {};
	traverse.call(obj, res);
	return res;
}

function transformStringArray(arr, opts = {}){
	let { ignoreCase = true, toCamelCase = false } = opts;
	return _(arr).map(value => {
		if (ignoreCase) 
			return value.toLowerCase();
		else if (toCamelCase)
			return camelCase(value);
		else
			return value;
	});
}
function hasFlag(value, flag, opts = {}){
	if (value == null || flag == null) return false;

	// if(typeof value != typeof flag)
	// 	throw new Error('value and flag must be of same type. allowed types: string, number');


	if (_.isNumber(value) && _.isNumber(flag)) {
		let has = value & flag;
		return opts.all === true ? has === flag : has > 0;
	} else if ((_.isNumber(value) && !_.isNumber(flag)) || (!_.isNumber(value) && _.isNumber(flag))) {
		return false;
	}

	if (!_.isArray(flag)) { flag = flag.toString(); }
	if (!_.isString(flag) && !_.isArray(flag)) { return false; }

	let rawflags = _.isArray(flag) 
		? flag
		: flag.split(/\s*,\s*/);


	let rawvalues;
	if(_.isString(value)){
		rawvalues = value.split(/\s*,\s*/);
	} else if(_.isArray(value)){
		rawvalues = values;
	} else if(_.isObject(value)) {
		rawvalues = opts.useObjectValues 
			? _.map(value, v => v)
			: _.keys(value);
	} else {
		return false;
	}

	let flags = transformStringArray(rawflags, opts);
	let values = transformStringArray(rawvalues, opts);

	let intersection = _.intersection(values, flags);		
	if (intersection.length == 0) return false;
	if (intersection.length == flags.length) return true;
	return opts.all != true;


	// if(_.isString(value) && _.isString(flag)) {
	// 	if(value === '' || flag === '') return false;
	// 	let values = transformStringArray(value.split(/\s*,\s*/), opts);
	// 	let flags = transformStringArray(flag.split(/\s*,\s*/), opts);

	// }

}

function isEmptyValue(arg, { allowWhiteSpace = false } = {}) {
	if (arg == null || _.isNaN(arg)) return true;
	if (!_.isString(arg)) return false;
	if (arg === '') return true;
	
	return !allowWhiteSpace && arg.trim() === '';
	
}

function normalizeStringArray(arr){
	return _.reduce(arr, (result,item) => {
		if(item == null) return;
		result.push(item.toString());
		return result;
	}, []);
}

function compare(a, b, options = {}){
	if (a == null) {
		return false;
	}
	let { caseInsensitive = true } = options;
	if (!_.isString(a)) {
		a = a.toString();
	}
	if(caseInsensitive) {
		a = a.toLowerCase();
		b = b.toLowerCase();
	}
	return a === b;
}

function getFlag(value, flag, options = {}){
	let flags;
	if (isEmptyValue(value) || isEmptyValue(flag)) { return; }	
	let { returnAs, useObjectValues, takeObjectKeys, all, delimeter = ', ', doNotPluck } = options;
	if(_.isString(flag)){
		flags = normalizeStringArray(flag.split(/\s*,\s*/gmi), options);
	}else if(_.isArray(flag)) {
		flags = normalizeStringArray(flag, options);
	} else {
		return;
	}
	if (returnAs == null) {
		returnAs = _.isArray(flag) ? 'array' : 'string';
	}
	if(_.isString(value)) {
		value = normalizeStringArray(value.split(/\s*,\s*/gmi), options);
	}
	let isArray = _.isArray(value);
	let method = all ? 'every' : 'some';
	let founded = _.reduce(value, (filtered, item, key) => {
		let check = item;
		if(!isArray && !useObjectValues){
			check = key;
		}
		
		let good = _[method](flags, flag => compare(check, flag, options));
		//console.log(method, good, flags, value);
		if (!good) { return filtered; }

		if (isArray) {
			filtered.push(check);
		} else {
			filtered.push({value: item, key });
		}
		return filtered;
	}, []);

	//console.log(founded);
	if (returnAs === 'string') {
		if (isArray) {
			return founded.join(delimeter);
		} else {
			let key = takeObjectKeys ? 'key' : 'value';
			return _.pluck(founded, key).join(delimeter);
		}
	} else if(returnAs === 'array'){
		if (isArray || doNotPluck) {
			return founded;
		} else {
			let key = takeObjectKeys ? 'key' : 'value';
			return _.pluck(founded, key);
		}
	} else if(returnAs === 'object') {
		return _.reduce(founded, (result, item, index) => {
			let value = isArray 
				? item 
				: takeObjectKeys ? item.key : item.value;
			let key = isArray 
				? index 
				: takeObjectKeys ? item.value : item.key;
			result[key] = value;
			return result;
		}, {});
	}

}

function pstoSetPair(context, pair){
	if(!_.isString(pair)) return;
	let keyvalue = pair.split('=');
	let key = keyvalue.shift();
	let value = keyvalue.join('=');
	pstoSetKeyValue(context, key, value);
}

function pstoSetKeyValue(context, key, value){
		
	if (key == null) return;
	key = decodeURIComponent(key);
	value != null && (value = decodeURIComponent(value));

	if(!(key in context))
		return (context[key] = value);

	!_.isArray(context[key]) && (context[key] = [context[key]]);

	context[key].push(value);

	return context[key];
}

function paramsToObject(raw, opts = {emptyObject: true}){
	let result = {};
	if(!_.isString(raw)) return opts.emptyObject ? result : raw;

	let pairs = raw.split('&');
	_(pairs).each((pair) => pstoSetPair(result, pair));
	
	return result;
}

function setProperty(context, name, value) {
	if (isModel(context)) {
		context.set(name, value, { silent: true });
	}
	else {
		context[name] = value;
	}

	return getProperty(context, name);
}

function ensureSetByPathArguments(context, path)
{
	let errors = [];
	if (context == null || !_.isObject(context)) {
		errors.push(new Error('Context is not an object'));
	}
	if (!_.isString(path) || path === '') {
		errors.push(new Error('Path is not a string'));
	}
	if (errors.length) {
		return errors;
	}
}

function setByPathArr(context, propertyName, pathArray, value, options) {

	let argumentsErrors = ensureSetByPathArguments(context, propertyName);
	if (argumentsErrors) {
		return;
	}

	let modelContext;
	if (isModel(context)) {
		modelContext = {
			model: context,
			property: propertyName,
			pathChunks: [].slice.call(pathArray)
		};
	}

	//set value if this is a last chunk of path
	if (!pathArray.length) {

		modelContext && options.models.push(modelContext);

		return setProperty(context, propertyName, value, options);

	} else {

		var prop = getProperty(context, propertyName);

		if (!_.isObject(prop) && !options.force) {
			return;
		} else if (!_.isObject(prop) && options.force) {
			prop = setProperty(context, propertyName, {}, options);
		} 

		modelContext && options.models.push(modelContext);

		var nextName = pathArray.shift();	
		return setByPathArr(prop, nextName, pathArray, value, options);

	}
}

function normalizeSetByPathOptions(opts = {}, ext)
{

	let options = _.extend({}, opts, ext, {
		silent: opts.silent === true,
		force: opts.force !== false,
		//passPath: [],
		models: []
	});

	return options;
}

function triggerModelEventsOnSetByPath(value, options = {})
{
	if (options.silent || !options.models.length) {
		return;
	}
	
	_(options.models).each(context => {
		let rest = context.pathChunks.join(':');
		if (rest) {
			context.model.trigger(`change:${context.property}:${rest}`, context.model, value);
		}
		context.model.trigger(`change:${context.property}`, context.model, value);
		context.model.trigger('change', context.model);
	});

}

function setByPath(context, path, value, opts = {}) {

	let argumentsErrors = ensureSetByPathArguments(context, path);
	if (argumentsErrors) {
		return value;
	}

	let pathArray = path.split('.');	
	let options = normalizeSetByPathOptions(opts, { path, pathArray: [].slice.call(pathArray) });

	let propertyName = pathArray.shift();

	let result = setByPathArr(context, propertyName, pathArray, value, options);

	if (result === undefined && value !== undefined) {
		return value;
	}

	triggerModelEventsOnSetByPath(value, options);

	return value;

	// if (_.isObject(path) && !_.isArray(path)) {
	// 	value = path.value;
	// 	options.force = path.force !== false;
	// 	options.silent = path.silent === true;
	// 	path = path.path;
	// }

	// var prop = pathArray.shift();

	// if (isModel(context)) {
	// 	options.models.push({
	// 		path: '',
	// 		property: prop,
	// 		model: context
	// 	});
	// }

}

function unFlat(obj) {

	if (obj == null || !_.isObject(obj)) return;
	var res = {};
	for (var e in obj) {
		setByPath(res, e, obj[e]);
	}
	return res;
}

function compareObjects(objectA, objectB) {

	if (!_.isObject(objectA) || !_.isObject(objectB)) {
		return objectA == objectB;
	}
	if ((_.isArray(objectA) && !_.isArray(objectB)) || (_.isArray(objectB) && !_.isArray(objectA))) {
		return false;
	}

	if (typeof objectA != typeof objectB) return false;

	let size = _.size(objectA);
	if(size != _.size(objectB)) return false;

	if (_.isArray(objectA)) {
		let allvalues = _.uniq(objectA.concat(objectB));
		return _.every(allvalues, value => {
			let valuesA = _.filter(objectA, _v => _v == value);
			let valuesB = _.filter(objectB, _v => _v == value);
			if (valuesA.length != valuesB.length) return false;
			return compareObjects(valuesA[0], valuesB[0]);
		});
	} else {
		let allkeys = _.uniq(_.keys(objectA).concat(_.keys(objectB)));
		if (allkeys.length != size) return false;
		return _.every(allkeys, key => {
			return compareObjects(objectA[key], objectB[key]);
		});
	}
}

function mergeObject(src, dst){
	if (!_.isObject(src) || !_.isObject(dst)) {
		return dst;
	}
	let flatSrc = flattenObject(src);
	let flatDst = flattenObject(dst);
	_.each(flatDst, (value, key) => {
		flatSrc[key] = value;
	});
	return unFlat(flatSrc);
}

function mergeOptions(options, keys) {
	if (!options) { return; }
  
	_.each(keys, key => {
		const option = options[key];
		if (option !== undefined) {
			this[key] = option;
		}
	});
}

function buildViewByKey(key, { TextView, options } = {}) {
	
	if(!_.isString(key)) { return; }

	let view = getOption(this, key, { args: [ this ] });
	let _options = getOption(this, key + 'Options', { args: [ this ] });

	if (TextView && _.isString(view)) {
		_options = _.extend({}, _options, { text: view });
		view = TextView;
	}
	options = _.extend({}, options, _options);

	if (isView(view)) {
		return view;
	} else if (isViewClass(view)) {
		return new view(options);
	}	
}

const enumsStore = {};

function getEnum(arg){
	if(isEmptyValue(arg)){
		return {};
	} else if(_.isString(arg)){
		return getByPath(enumsStore, arg) || {};
	} else if(_.isObject(arg)){
		return arg;
	}
}

function get(arg, flag, options){
	let _enum = getEnum(arg);
	return getFlag(_enum, flag, options);
}

function has(arg, flag, options){
	let _enum = getEnum(arg);
	return hasFlag(_enum, flag, options);
}

var index$5 = {
	get,
	has,
	set(name, hash){
		if(_.isString(name)){
			setByPath(enumsStore, name, hash);
		} else if (_.isObject(name)){
			_.extend(enumsStore, name);
		}
	},
};

function skipTake(array, take, skip = 0){
	if (array == null) { return; }
	if (!_.isNumber(take) || _.isNumber(skip)) {
		throw new Error('skipTake skip and take arguments must be a number');
	}
	if (!_.isArray(array) && _.isObject(array)) {
		array = _.toArray(array);
	}
	let length = take + skip;
	if(array.length < length) { length = array.length; }
	let taken = [];
	for (let x = skip; x < length; x++) {
		taken.push(array[x]);
	}
	return taken;
}

/*
export default {
	betterResult, camelCase,
	comparator, compareAB, convertString, extend,
	flat, getByPath, getOption, hasFlag, isKnownCtor, 
	mix, paramsToObject, setByPath, toBool, unflat,
	isModel, isModelClass, isCollection, isCollectionClass, isView, isViewClass,
	triggerMethod, triggerMethodOn, mergeOptions,
	compareObjects, mergeObjects
};
*/


var index$6 = Object.freeze({
	betterResult: betterResult,
	camelCase: camelCase,
	takeFirst: takeFirst,
	comparator: comparator,
	compareAB: compareAB,
	convertString: convertString,
	extend: extend,
	flat: flattenObject,
	getByPath: getByPath,
	getOption: getOption,
	hasFlag: hasFlag,
	getFlag: getFlag,
	isKnownCtor: isKnownCtor,
	mix: mix,
	paramsToObject: paramsToObject,
	setByPath: setByPath,
	toBool: convertToBoolean,
	unflat: unFlat,
	compareObjects: compareObjects,
	mergeObjects: mergeObject,
	triggerMethod: triggerMethod,
	triggerMethodOn: triggerMethodOn,
	mergeOptions: mergeOptions,
	buildViewByKey: buildViewByKey,
	enums: index$5,
	skipTake: skipTake,
	isModel: isModel,
	isModelClass: isModelClass,
	isCollection: isCollection,
	isCollectionClass: isCollectionClass,
	isView: isView,
	isViewClass: isViewClass
});

const defaultSelector = (name, prefix = '') => prefix + 'region-' + name;

function defaultUpdateDom(name, $el)
{
	let selector = defaultSelector(name);
	let element = $('<div>').addClass(selector);
	$el.append(element);

	return '.' + selector;
}

function buildRegionFunc(view, hash, context){

	let { $el } = view;	
	let { autoCreateRegion } = context;
	let { updateDom, name, el } = hash;
	let regionEl;
	
	let region = view.getRegion(name);


	if (el == null && autoCreateRegion !== false) {

		let testEl = region && region.getOption('el',{ deep:false});

		if (!region || !testEl || !$el.find(testEl).length) {

			regionEl = defaultUpdateDom(name, $el);

		} 

	} else if(_.isFunction(updateDom)) {
		updateDom.call(view, $el, view);

	} 
	
	
	if (!region) {
		let definition = _.pick(hash, 'replaceElement', 'regionClass');
		definition.el = hash.el || regionEl;
		region = view.addRegion(name, definition);
	}


	return region;
}

function normalizeNestedViewContextRegion(context) {

	let { region } = context;
	let regionName = (_.isString(region) && region) || context.regionName || context.name;

	if (_.isString(region) || region == null) {
		region = {};
	} else if (_.isFunction(region)) {
		region = region.call(this, context, this);
	}

	if (_.isObject(region)) {

		if(!region.name)
			region.name = regionName;
		let replaceElement = this.getOption('replaceNestedElement');
		context.region = _.extend({ replaceElement }, region);
		context.show = _.partial(buildRegionFunc, this, context.region, context);
	}
	return context;
}

//import result from '../../../utils/better-result';
var index$7 = Base => Base.extend({
	constructor(){
		this._nestedViews = {};
		Base.apply(this, arguments);
		this.initializeNestedViews();
	},
	template: false,

	showAllNestedViewsOnRender: false,
	showNestedViewOnAdd: false,
	replaceNestedElement: true,

	initializeNestedViews(){
		if (this._nestedViewsInitialized) return;

		if(this.getOption('showAllNestedViewsOnRender')) {
			this.on('render', () => this.showAllNestedViews());
		}

		let nesteds = this.getOption('nestedViews', { args:[this.model, this]});
		_(nesteds).each((context, index) => {

			let name = _.isString(index) ? index : (context.name || _.uniqueId('nested'));
			this.addNestedView(name, context);

		});

		this._nestedViewsInitialized = true;
	},
	_normalizeNestedContext(name, context){

		if (isViewClass(context)) {
			let View$$1 = context;
			context = {
				name, View: View$$1
			};
		}

		//unwrap to plain object
		if (_.isFunction(context)) {
			context = context.call(this, this.model, this);
		}

		//fix name if its not provided
		if (context.name == null) {
			context.name = name || _.uniqueId('nested');
		}

		//convert region to valid function
		context = normalizeNestedViewContextRegion.call(this, context);		


		return context;
	},
	_createNestedContext(context){
		let contexts = this.getNestedViewContext();
		contexts[context.name] = context;
	},

	addNestedView(name, context){

		if (!_.isString(name) || name === '') {
			throw new Error('addNestedView: first argument should be a string');
		}

		context = this._normalizeNestedContext(name, context);
		this._createNestedContext(context);
		if(this.getOption('showNestedViewOnAdd') && this.isRendered()){
			this.showNestedView(context);
		}		
	},

	showNestedView(name){
		let region = this.getNestedViewRegion(name);
		let view = region && this.buildNestedView(name);
		if (view) {
			region.show(view);
		}
	},
	showAllNestedViews(){
		let contexts = this.getNestedViewContext();
		_(contexts).each(context => this.showNestedView(context));
	},
	getNestedViewContext(name){
		let contexts = this._nestedViews;
		if (arguments.length == 0)
			return contexts;
		else
			return contexts[name];
	},


	buildNestedView(name){

		let context = _.isObject(name) ? name
			: _.isString(name) ? this.getNestedViewContext(name)
				: null;

		if(!context) return;
		let passedView = betterResult(context, 'view', { context: this, args: [this, this.model] });
		if(_.isFunction(context.template))
			return context.template;
		else if ( isView(passedView) ) {
			return passedView;
		}
		else {
			let View$$1 = context.View;
			let options = this.buildNestedViewOptions(betterResult(context, 'options', { context: this, args: [this, this.model], default:{} }));
			
			return new View$$1(options);
		}
	},
	buildNestedViewOptions(opts){
		return opts;
	},
	getNestedViewRegion(name){
		let context = _.isObject(name) ? name
			: _.isString(name) ? this.getNestedViewContext(name)
				: null;
		return context && _.result(context, 'show');
	}
	
});

var borrow = {
	getOption: instanceGetOption,
	mergeOptions: mergeOptions,
	triggerMethod: triggerMethod,
};

var collection = {

	//desc: setups the collection for ViewManager instance
	//returns: previous collection
	setCollection(collection, { init = false} = {}){
		
		if (this.collection == collection) return;

		//take previous collection for return
		let previousCollection = this.collection;

		//take contexts to destroy
		let destroy = this._removeCollection() || [];

		this.collection = collection;

		if (collection == null && destroy.length){
			this.trigger('change', { destroy });
			return;
		}

		init && this.initModels();
		this._setCollectionListeners();


		return previousCollection;
	},
	_clearCollectionStore(){
		
		let store = this._store;
		store.filtered.length = 0;
		store.items.length = 0;
		store.byModel = {};
		store.isFiltered = false;
		store.isSorted = false;
	},
	_removeCollection(){
		if (this.collection == null) return;

		let previousCollection = this.collection;

		this.stopListening(previousCollection);

		let destroy = this._removeItems(previousCollection.models);

		delete this.collection;

		this._clearCollectionStore();

		delete this._modelsInitialized;

		return destroy;

	},
	_setCollectionListeners(){
		if(!this.collection) return;
		this.listenTo(this.collection, 'update', this._onCollectionUpdate);
		this.listenTo(this.collection, 'reset', this._onCollectionReset);
		this.listenTo(this.collection, 'sort', this._onCollectionSort);
		if (this.collection.length === 0) {
			this.listenToOnce(this.collection, 'sync', this._onCollectionFirstFetch);
		}
	},

	//first run, initialized all collection models
	initModels(){

		if(!this.enableCollection || this._modelsInitialized) return;

		this._rebuildModels();

		this._modelsInitialized = true;

	},

	_rebuildModels({ sort = true} = {}){

		let items = this._store.items;
		let filtered = this._store.filtered;
		items.length = 0;
		filtered.length = 0;

		let filter = this.getFilter();
		let models = this.collection.models;

		for(let index = 0, length = models.length; index < length; index++) {
			let model = models[index];

			let context = this._getModelContext(model, { create: true });
			context.index = index;

			this._storeContext(context);
			items.push(context);

			if(!filter || filter(context))
				filtered.push(context);

		}
		this._store.isFiltered = true;

		sort && this._sortItems(filtered, { comparator: this.getComparator(), force: true },'rebuild');
		this._store.isSorted = sort;

	},
	_onCollectionUpdate(col, opts = {}){

		let { changes = {} } = opts;
		let { added = [], removed = [], merged = [] } = changes;
		let destroy;
		if (removed.length) {

			destroy = this._removeItems(removed);
			this._rebuildModels();

		} else {
			if(added.length) {				
				let data = this._filterItems(added, { force: true });
				this._addItems(data.attach, { isSorted: false });		
			}
			if(merged.length){
				this._store.isFiltered = false;
			}
			if((added.length || merged.length) && !_.isFunction(this.getComparator())){
				this._updateIndexes();
			}
		}
		this.processAndRender({ destroy });
	},

	_addItems(items, {isSorted, isFiltered} = {}){

		if(!items || !items.length) return;

		isSorted != null && (this._store.isSorted = isSorted);
		isFiltered != null && (this._store.isFiltered = isFiltered);

		let filter = this.getFilter();

		let _items = this._store.items;
		let _filtered = this._store.filtered;

		for (let index = 0, length = items.length; index < length; index++) {
			let item = items[index];
			_items.push(item);
			if(!filter || filter(item))
				_filtered.push(item);
		}
		this._store.isFiltered = true;

	},	

	_onCollectionFirstFetch(){
		if(this.collection.length) return;
		this.processAndRender();
	},

	_onCollectionSort(col, { add, merge, remove } = {}){

		if (_.isFunction(this.getComparator())) return;
		if (add || remove || merge) {
			return;
		}

		this._updateIndexes();

		let items = this._getItems();
		this._sortItems(items, { comparator: this._dataComparator, force: true },'collectionsort');
		this._store.isSorted = true;
		this.processAndRender();

	},

	_onCollectionReset(col, { previousModels = []} = {}){

		let destroy = this._removeItems(previousModels);
		this._rebuildModels();
		this.processAndRender({ destroy });

	},
};

var common = {
	_ensureOptions(){
		if(!this.view)
			throw new Error('view is not set');

		if(!this.$container){
			this.$container = this.view.$el;
		}

	},
	getPaginator(){
		let skip = this.skip || 0;
		let take = this.take || Infinity;
		!_.isNumber(skip) || skip < 0 && (skip = 0);
		!_.isNumber(take) || take < 0 && (take = Infinity);
		if(skip == 0 && take == Infinity)
			return;
		else
			return {
				from: skip,
				to: skip + take
			};
	},
	_dataComparator(a, b){
		return a.index - b.index;
	},	
	getComparator(){
		return this.dataComparator;
	},
	setComparator(comparator, {preventRender} = {}){

		if(this.dataComparator == comparator) return;

		this.dataComparator = comparator;
		this._store.isSorted = false;

		if(!preventRender)
			this.processAndRender();
	},
	getFilter(){
		return this.dataFilter;
	},
	setFilter(filter, {preventRender} = {}){
		if(this.dataFilter == filter) return;

		this.dataFilter = filter;
		this._store.isFiltered = false;
		if(!preventRender)
			this.processAndRender();
	},
};

var customs = {

	getCustoms(){
		return this._store.customs;
	},
	addCustomView(arg, index){		
		let customContext = this._normalizeAddCustomContext(arg, index);
		if (!customContext) { return; }
		this._store.customs.push(customContext);
		if(isView(customContext.view) && !customContext.view._isDestroyed) {
			this._setupJustCreatedView(customContext.view, customContext);
		}
	},
	removeCustomViews(){
		let customs = this.getCustoms() || [];
		_.each(customs, custom => {
			if(!custom.view) return;
			
			if(this._checkCustomCondition(custom.view, custom)) { return; }

			if (custom.rebuild)
				this._destroyChildView(custom.view);
			else
				this._detachChildView(custom.view);
		});
	},

	_checkCustomCondition(customView, custom){
		
		if (this.enableFilterForCustomViews) {
			let filter = this.getFilter();
			return !filter || filter(customView);
		}

		if (_.isFunction(custom.condition)) {
			return custom.condition.call(this.view, customView, this.view);
		} else if(custom.condition != null){
			return custom.condition;
		} else {
			return true;
		}

	},
	//also accepts destroyed as third argument
	_injectCustoms(items, detached){

		if (this.collection && !items.length) {
			items = [];
			this._injectEmptyView(items);
		}

		let customs = this.getCustoms() || [];

		if(!customs.length)
			return items;

		let newitems = items.slice(0);
		_.each(customs, custom => {

			let view = this._ensureContextHasView(custom);
			if(!view) return;

			if(!this._checkCustomCondition(view, custom)){

				detached.push(custom);
				return;
			}

			if(custom.index == null){
				newitems.push(custom);
			} else {
				newitems.splice(custom.index, 0, custom);
			}
		});
		return newitems;
	},

	_normalizeAddCustomContext(arg, index){
		if (isView(arg) && !arg._isDestroyed) {
			return {
				view: arg,
				rebuild: false,
				index
			};
		} else if (_.isFunction(arg) && isViewClass(arg)){
			return {
				build: () => new arg(),
				index,
				rebuild: true,
			};
		} else if(_.isFunction(arg)) {
			return {
				build: arg,
				index,
				rebuild: true,
			};
		} else if (_.isObject(arg) && !isView(arg)) {
			if (arg.build == null && arg.view == null) { return; }
			if (index != null)
				arg.index = index;

			if (_.isFunction(arg.view)) {
				let viewFn = arg.view;
				delete arg.view;
				let options = arg.options;
				if(isViewClass(viewFn)){
					arg.build = () => new viewFn(betterResult({ options }, 'options', { context: this.view }));
				} else {
					arg.build = () => viewFn.call(this.view, betterResult({ options }, 'options', { context: this.view }));
				}
			}

			if (arg.rebuild == null) {
				arg.rebuild = !isView(arg.view);
			}
			return arg;
		}
	}	
};

function isInPage(paginator, index){
	return !paginator || (index >= paginator.from && index < paginator.to);
}

function viewIsGood(view){
	return view && !view._isDestroyed;
}

function renderView(view) {
	if (view._isRendered) {
		return;
	}

	if (!view.supportsRenderLifecycle) {
		view.triggerMethod('before:render', view);
	}

	view.render();
	view._isRendered = true;

	if (!view.supportsRenderLifecycle) {
		view.triggerMethod('render', view);
	}
}

function destroyView(view, disableDetachEvents) {
	if (view.destroy) {
		// Attach flag for public destroy function internal check
		view._disableDetachEvents = disableDetachEvents;
		view.destroy();
		return;
	}

	// Destroy for non-Marionette Views
	if (!view.supportsDestroyLifecycle) {
		view.triggerMethod('before:destroy', view);
	}

	const shouldTriggerDetach = view._isAttached && !disableDetachEvents;

	if (shouldTriggerDetach) {
		view.triggerMethod('before:detach', view);
	}

	view.remove();

	if (shouldTriggerDetach) {
		view._isAttached = false;
		view.triggerMethod('detach', view);
	}

	view._isDestroyed = true;

	if (!view.supportsDestroyLifecycle) {
		view.triggerMethod('destroy', view);
	}
}

var models = {


	process({ destroy = [], silent, forceSort, forceFilter } = {}){

		this._removeEmptyViewInstance({ destroy });

		let items = this._getItems({ forceFilter });



		let totalDetach = [];

		if (!this._store.isFiltered || forceFilter) {
			let { attach, detach } = this._filterItems(items, { filter: this.getFilter() });
			this._setItems(attach, { isFiltered: true });
			items = attach;
			if(detach.length) {
				//resultData.detach = resultData.detach.concat(detach);
				totalDetach = totalDetach.concat(detach);
			}
			//resultDetach = detach;
		}
		this._sortItems(items, { comparator: this.getComparator(), force: forceSort },'process');
		this._store.isSorted = true;



		let data = this._filterItems(items, { paginator: this.getPaginator() });
		if(data.detach.length) {
			//resultData.detach = resultData.detach.concat(data.detach);
			totalDetach = totalDetach.concat(data.detach);
		}


		let attach = this._injectCustoms(data.attach, totalDetach, destroy);

		let result = {
			attach,
			detach: totalDetach,
			destroy,
			total: data.total,
			skiped: data.skiped,
			taked: data.taked
		};

		
		this.lastResult = result;
		if(!silent)
			setTimeout(() => this.trigger('change', result), 0);

		


		return result;
	},


	_getItems({ forceFilter } = {}){

		if (this._store.isFiltered && !forceFilter)
			return this._store.filtered;
		else
			return this._store.items;
	},

	_filterItems(items, { filter, paginator, force } = {}){

		let iterator = -1;
		let detach = [];
		let attach = [];


		if (!filter && !paginator && !force) {
			
			return { attach: items, detach:[] };
		
		}
		
		
		let shouldUpdateIndex = this.collection && items == this.collection.models;
		
		
		for(let index = 0, length = items.length; index < length; index++){

			let model = items[index];
			let item = model;
			let isModel$$1 = isModel$$1(model);
			let isNew = false;

			if (isModel$$1) {
				item = this._getModelContext(model, { create: true, markNew: true });
				isNew = item.isNew === true;				
			}

			let pass = !filter || filter(item);
			if (!pass) {
				item.view && !item.view._isDestroyed && detach.push(item);
				continue;
			}

			if(isInPage(paginator, ++iterator)) {
				attach.push(item);

				if(shouldUpdateIndex){
					item.index = index;
				}
				if (isNew) {
					this._storeContext(item);
				}
			} else if (paginator && iterator > paginator.to){
				break;
			}			
		}

		
		let res = { attach , detach };
		if(paginator){
			res.total = items.length;
			res.skiped = paginator.from;
			res.taked = iterator - paginator.from - 1;
		}

		// resultData.attach = attach;
		// resultData.detach = detach;

		return res;
	},

	_sortItems(items, { comparator, force } = {}){

		if(this._store.isSorted && !force) { return; }

		if(!comparator) {
			comparator = this._dataComparator;
			if(!comparator) return;
		}

		if (this._store.isFiltered && items !== this._store.items) {
			setTimeout(() => this._sortItems(this._store.items, { comparator, force: true },'timeout sort'),0);
		}

		
		let iteratee = comparator.length == 1 
			? (a,b) => {
				let _a = comparator(a); let _b = comparator(b);
				if(_a < _b) return -1;
				if(_a > _b) return 1;
				return 0;				
			}
			: comparator;

		items.sort(iteratee);
		
	},


	_setItems(items, { isSorted, isFiltered } = {}){

		isSorted != null && (this._store.isSorted = isSorted);
		isFiltered != null && (this._store.isFiltered = isFiltered);
		if (isFiltered) {
			this._store.filtered = items;
		} else {
			this._store.items = items;
		}

	},

	_removeItems(items = []){

		let destroy = [];
		for (let index = 0, length = items.length; index < length; index++) {
			let item = items[index];
			let view = this._removeItem(item);
			view && destroy.push(view);
		}
		return destroy;
	},

	_removeItem(item){
		let model = isModel(item) ? item : item.model;
		let context = this._store.byModel[model.id] || this._store.byModel[model.cid];
		delete this._store.byModel[model.id];
		delete this._store.byModel[model.cid];
		return context.view;
	},

	_getModelView(model){
		let id = model.id == null ? model.cid : model.id;
		let context = this._store.byModel[id];
		return context && context.view;
	},

	_getModelContext(model, { create, markNew } = {}){
		let id = model.id == null ? model.cid : model.id;
		let context = this._store.byModel[id];
		if (context) { return context; }
		if (create) {
			context = { model, isCollection: true };
			markNew && (context.isNew = true);
			return context;
		}
	},

	_storeContext(context){
		let id = context.model.id;
		context.isNew && (delete context.isNew);
		if(id != null)
			this._store.byModel[id] = context;
		this._store.byModel[context.model.cid] = context;
	},

	_initView(context){
		if(context.view && !context.view._isDestroyed)
			return;
		context.view = this.createView(context.model);
	},

	_updateIndexes(){

		let models = this.collection.models;
		for (let index = 0, length = models.length; index < length; index++) {
			let model = models[index];
			let id = model.id == null ? model.cid : model.id;
			let context = this._store.byModel[id];
			context && (context.index = index);
		}
	},


};

var render = {

	triggerViewMethod(){
		this.view.triggerMethod.apply(this.view, arguments);
	},
	getChildrenContainer(){
		if(_.isString(this.$container))
			return this.view.$(this.$container);
		else if(_.isFunction(this.$container))
			return this.$container();
		else
			return this.$container;
	},
	processAndRender(opts){
		let data = this.process(opts);
		this.render(data);
	},
	beforeRender(){
		if (this.view._isRendered) {
			this.removeCustomViews();
		}
		else {
			this.initModels();
		}
	},
	render(data){		
		if(!data) {
			return;
		}
		else {

			this.triggerViewMethod('before:render:children', data);

			// if(this.view._isRendered)
			// 	this.removeCustomViews();

			this._destroyChildViews(data.destroy);
			this._detachChildViews(data.detach);
			this._attachChildViews(data.attach);

			this.triggerViewMethod('render:children', data);

		}
	},


	_destroyChildViews(views = []){
		if(!views.length) return;
		let $container = this.getChildrenContainer();
		this.triggerViewMethod('before:destroy:children', this);

		if (this.view.monitorViewEvents === false) {
			this.view.Dom.detachContents($container);
		}
	
		const shouldDisableEvents = this.view.monitorViewEvents === false;
		_.each(views, view => {
			this._destroyChildView(view, shouldDisableEvents);
		});
	
	
		this.triggerViewMethod('destroy:children', this);

	},

	_destroyChildView(view, shouldDisableEvents){

		if(shouldDisableEvents == null)
			shouldDisableEvents = this.view.monitorViewEvents === false;

		//view.off('destroy', this.removeChildView, this);
		if (!view || view._isDestroyed) {
			return;
		}
		destroyView(view, shouldDisableEvents);		
		this.view.stopListening(view);
	},

	_detachChildViews(contexts = []){
		if(!contexts.length) return;
		let monitorViewEvents = this.monitorViewEvents !== false;
		_.each(contexts, context => {
			this._detachChildView(context.view, monitorViewEvents);
		});
	},

	_detachChildView(view, monitorViewEvents){
		if(!view) return;
		if(monitorViewEvents == null) {
			monitorViewEvents = this.view.monitorViewEvents !== false;
		}
		const shouldTriggerDetach = view._isAttached && monitorViewEvents;
		if (shouldTriggerDetach) {
			view.triggerMethod('before:detach', view);
		}
				
		this.view.Dom.detachEl(view.el, view.$el);
		if (shouldTriggerDetach) {
			view._isAttached = false;
			view.triggerMethod('detach', view);
		}	
		//this.view.stopListening(view);
	},

	_attachChildViews(contexts = []){
		if(!contexts.length) return;
		
		const shouldTriggerAttach = this.view._isAttached && this.view.monitorViewEvents !== false;

		const elBuffer = this.view.Dom.createBuffer();
		let $container = this.getChildrenContainer();
		_.each(contexts, context => {
			let view = this._ensureContextHasView(context);

			if (!view) return;

			!view._isRendered && renderView(view);
			this.view.Dom.appendContents(elBuffer, view.el, {_$contents: view.$el});

			if (shouldTriggerAttach && !view._isAttached) {				
				view.triggerMethod('before:attach', view);
			}
		});

		this.view.Dom.appendContents($container[0], elBuffer, {_$el: $container});

		if(shouldTriggerAttach){
			_.each(contexts, context => {
				let view = context.view;
				if(!view || view._isAttached) return;
				view._isAttached = true;
				view.triggerMethod('attach', view);
			});			
		}
	},


	_ensureContextHasView(context){
		if (viewIsGood(context.view))
			return context.view;
		else if (context.isCollection) {
			context.view = this._createModelChildView(context.model);
			return context.view;
		} else if(context.rebuild && _.isFunction(context.build)) {
			context.view = this._createCustomChildView(context);
			return context.view;
		} 
	},
	_createChildView(context){
		let created;
		if (context.isCollection) {
			context.view = this._createModelChildView(context.model);
			created = !!context.view;
		} else if (_.isFunction(context.build) && (!viewIsGood(context.view) || context.rebuild)) {
			context.view = this._createCustomChildView(context);
			created = !!context.view;
		}
		if (!created) return;

		this._setupJustCreatedView(context.view, context);
	},
	_createCustomChildView(context){
		return context.build();
	},
	_createModelChildView(model){
		let View$$1 = this._getChildViewClass(model);
		if(!View$$1) return;
		let options = this._getChildViewOptions(model, View$$1);
		let view = new View$$1(options);
		return view;
	},
	_setupJustCreatedView(view, context){
		if (_.isFunction(context.onBuild)) {
			context.onBuild.call(this.view, view);
		}
		this.view._proxyChildViewEvents(view);		
	},
	_getChildViewClass(model){
		if(isView(this.modelView))
			return this.modelView;
		else {
			return this.modelView(model);
		}
	},
	_getChildViewOptions(model, View$$1){
		let options = {};
		if(_.isFunction(this.modelViewOptions)){
			options = this.modelViewOptions.call(this, model, View$$1, this) || {};
		} else if(_.isObject(this.modelViewOptions)) {
			options = this.modelViewOptions;
		}
		return _.extend({}, options, { model });
	},




};

const EmptyViewMixin = {
	removeEmptyViewInstance(opts = {}){
		let view = this._emptyViewInstance;
		if (!view) return;
		let { destroy = []} = opts;
		if (view) {
			delete this._emptyViewInstance;
			destroy.push(view);
			opts.destroy = destroy;
		}
	},
	_getEmptyViewClas(){
		if (!this.emptyView) { return; }
		else if(isViewClass(this.emptyView)){
			return this.emptyView;
		} else if(_.isFunction(this.emptyView)) {
			return this.emptyView.call(this.view);
		}
	},
	_injectEmptyView(items){
		let View$$1 = this._getEmptyViewClas();
		if (!View$$1) return;
		let options = _.extend({}, this.emptyViewOptions);
		let view = new View$$1(options);
		this._emptyViewInstance = view;
		items.push({ view });
	},
	_removeEmptyViewInstance({ destroy = [] } = {}){
		let view = this._emptyViewInstance;
		if (!view) return;

		if (view) {
			delete this._emptyViewInstance;
			destroy.push(view);
		}
	},	
};

const MergeOptions = [
	'createView',
	'dataFilter',
	'dataComparator',
	'enableCollection',
	'$container',
	'view',
	'modelView',
	'modelViewOptions',
	'emptyView',
	'emptyViewOptions',
	'enableFilterForCustomViews'
];

const ViewManager = function(options = {}){
	this.options = _.omit(options, 'collection');
	this.mergeOptions(options, MergeOptions);
	this._ensureOptions();
	this._store = {

		//holds current filtered set of model contexts
		filtered:[],

		//holds all model contexts
		items: [],

		//grants fast access to a context through model id or cid
		byModel: {},

		//holds all cutoms contexts
		customs: [],
	
		//indicates if comparator should be applied
		isSorted: false,

		//indicates if filter should be applied
		isFiltered: false,

	};
	
	//in collection mixin
	if(this.enableCollection)
		this.setCollection(this.collection || options.collection);
};

ViewManager.extend = extend;

_.extend(ViewManager.prototype, Backbone.Events, borrow, collection, common, customs, models, render, EmptyViewMixin);

var index$8 = BaseView => BaseView.extend({
	
	constructor(options){
		this.options = options;
		this.mergeOptions(options,['managedCollection','collection','viewFilter','viewComparator', 'modelView', 'modelViewOptions', 'emptyView', 'emptyViewOptions']);
		
		BaseView.apply(this, arguments);
		
		//tries to initialize viewManager
		this._initializeViewManager();
	},

	template: _.noop,
	//if true - initializes ViewManager without collection support
	enableCustomViews: false,
	//if true - initializes ViewManager with collection and customviews support
	enableCollectionViews: false,

	_initializeViewManager(){
		let customs = this.getOption('enableCustomViews');
		let models = this.getOption('enableCollectionViews');
		if(!(customs || models)) return;
		
		let enableFilterForCustomViews;
		if (!models && customs && this.getFilter()) {
			enableFilterForCustomViews = true;
		}

		this._fallbackOptions();

		this._viewManager = new ViewManager({
			enableCollection: models,
			collection: models && this.managedCollection || this.collection || null,
			view: this,
			$container: this.getChildrenContainer(),
			modelView: this.modelView,
			modelViewOptions: this.modelViewOptions,
			dataFilter: this.getFilter(),
			dataComparator: this.getComparator(),
			emptyView: this.emptyView,
			emptyViewOptions: this.emptyViewOptions,
			enableFilterForCustomViews
		});

		if (this._customViewsQueue) {
			_.each(this._customViewsQueue, args => this._viewManager.addCustomView.apply(this._viewManager, args));
			this._customViewsQueue.length = 0;
			delete this._customViewsQueue;
		}

	},

	_fallbackOptions(){
		if(!this.modelView) {
			this.modelView = this.childView || this.options.childView;
		}
		if(!this.modelViewOptions){
			this.modelViewOptions = this.childViewOptions || this.options.childViewOptions;
		}
	},	


	/*
		render has two additional calls
			- this._viewManager.beforeRender()
			- this._viewManager.processAndRender()
	*/
	render() {
		const template = this.getTemplate();

		if (template === false || this._isDestroyed) { return this; }

		this._viewManager && this._viewManager.beforeRender();

		this.triggerMethod('before:render', this);


		// If this is not the first render call, then we need to
		// re-initialize the `el` for each region
		if (this._isRendered) {
			this._reInitRegions();
		}

		this._renderTemplate(template);
		this.bindUIElements();

		this._viewManager && this._viewManager.processAndRender();

		this._isRendered = true;
		this.triggerMethod('render', this);

		return this;
	},


	getChildrenContainer(){
		return this.getOption('childrenContainer', { force: false });
	},

	/*
		managing sort and filter
	*/
	setComparator(comparator, opts) {
		this._viewManager && this._viewManager.setComparator(comparator, opts);
		this.viewComparator = comparator;
		return this;
	},
	getComparator(){
		return this.viewComparator;
	},
	setFilter(filter, opts) {
		this._viewManager && this._viewManager.setFilter(filter, opts);
		this.viewFilter = filter;
		return this;
	},
	getFilter(){
		return this.viewFilter;
	},


	/*
		fallback methods for CollectionView 
	*/
	sort(){
		this._viewManager && this._viewManager.processAndRender({ forceSort: true, forceFilter: true });
	},
	filter(){
		this._viewManager && this._viewManager.processAndRender({ forceFilter: true });
	},	

	addChildView(...args){
		if (!args || args.length == 0) return;
		if (this._viewManager) {
			this._viewManager.addCustomView.apply(this._viewManager, arguments);
		} else {
			this._customViewsQueue || (this._customViewsQueue = []);
			this._customViewsQueue.push(args);
		}
	},

});

var destroy = Base => Base.extend({
	destroy(){
		if(this._isDestroyed || this._isDestroying) { return; }
		this._isDestroying = true;
		Base.prototype.destroy.apply(this, arguments);
		delete this._isDestroying;
	},
	isDestroyed(){
		return this._isDestroyed || this._isDestroying;
	}
}, { DestroyMixin: true });

var index$9 = Base => Base.extend({
	buildViewByKey(...args){
		return buildViewByKey.call(this, ...args);
	},
});



var index$10 = Object.freeze({
	cssClassModifiers: cssClassModifiers,
	nestedViews: index$7,
	nextView: index$8,
	destroy: destroy,
	buildViewByKey: index$9
});

var index$11 = Base => Base.extend({
	triggerNameEvent: true,
	stopEvent: true,
	constructor(options){
		Base.apply(this, arguments);
		this.mergeOptions(options, ['name']);
	},
	tagName:'button',
	template: _.template('<i></i><span><%= text %></span><i></i>'),
	events:{
		'click'(e) {
			let stop = this.getOption('stopEvent');
			if (stop) {
				e.stopPropagation();
				e.preventDefault();
			}
			this.beforeClick().then(
				data => {
					this.triggerMethod('click', data, e, this);
					if (this.name) {
						this.triggerMethod('click:'+this.name, data, e, this);
					}
				},
				error => {
					this.triggerMethod('click:fail', error, this.name, e, this);
					if (this.name) {
						this.triggerMethod('click:'+this.name+':fail', error, e, this);
					}
				}
			);
		}
	},
	beforeClick(){
		let result = this.triggerMethod('before:click');
		if(result && _.isFunction(result.then) ) {
			return result;
		} else {
			return Promise.resolve(result);
		}
	},
	templateContext(){
		return {
			text: this.getOption('text')
		};
	},
	disable(){
		this.$el.prop('disabled', true);
	},
	enable(){
		this.$el.prop('disabled', false);
	},
});

function getTriggerMethod(context){
	if(!context) { return () => {}; }
	return _.isFunction(context.triggerMethod) ? context.triggerMethod
		: _.isFunction(context.trigger) ? context.trigger
			: () => {};
}

function ensureError(error, value){
	if(error instanceof Error){
		throw error;
	}
	return arguments.length > 1 ? value : error;
}


var ControlMixin = Base => Base.extend({

	isControl: true,
	constructor(options){		
		this._initControl(options);
		Base.apply(this, arguments);
		if (this.getOption('validateOnReady')) {
			this.once('control:ready', () => {
				this.validate().catch(() => {});
			});
		}
	},
	_onControlDestroy(){
		let parent = this.getParentControl();
		if (parent && _.isFunction(parent._removeChildControl)) {
			parent._removeChildControl(this);
		}
		let children = this.getChildrenControls();
		if (children) {
			_.each(children, child => child._removeParentControl());
			children.length = 0;
		}
		delete this._cntrl;
	},
	_removeChildControl(control){
		this.off(control);
		let children = this.getChildrenControls();
		if (!children.length) { return; }
		let index = children.indexOf(control);
		if (index === -1) return;
		children.splice(index, 1);
	},
	_addChildControl(control){
		let controlName = control.getControlName();
		let children = this.getChildrenControls();
		let found = _.find(children, child => child.getControlName() === controlName);
		!found && children.push(control);
		// this.listenTo(control, 'control:invalid', (error) => {
		// 	this._onControlValidateFail(error, this.getControlValue({ notValidated: true })).catch(() => {});
		// });
	},
	_removeParentControl(){
		delete this._cntrl.parent;
	},
	_initControl(options = {}){
		if (this._controlInitialized) { return; }

		this._cntrl = {};
		let name = takeFirst('controlName', options, this) || 'control';
		this._cntrl.name = name;

		let value = takeFirst('value', options, this);
		value = this._clone(value);
		this.initControlValue(value);
		this.initParentControl(options);

		this.once('destroy', this._onControlDestroy);

		this._controlInitialized = true;
	},
	initParentControl(options){
		let parent = takeFirst('proxyTo', options, this) || takeFirst('parentControl', options, this);
		this.setParentControl(parent);
	},
	setParentControl(parent){
		this._cntrl.parent = parent;
		if (parent && _.isFunction(parent._addChildControl)) {
			parent._addChildControl(this);
		}
	},
	initControlValue(value){
		this._cntrl.initial = value;
		this._cntrl.value = value;
		//this.setControlValue(value, { silent: true });
	},
	getControlName(){
		return this._cntrl.name;
	},

	isSameControlValue(value){
		let current = this.getControlValue();
		return this.isValid() && compareObjects(current, value);
	},

	getControlValue(key, options = {}){
		
		if(_.isObject(key)) {
			options = key;
			key = undefined;
		}
		let { notValidated, clone } = options;
		let valueKey = notValidated ? 'notValidated' : 'value';
		let value = this._cntrl[valueKey];
		if (key != null) {
			return getByPath(value, key);
		} else {
			return clone ? this._clone(value) : value;
		}
	},

	setControlValue(value, options = {}){
		let  { key, notValidated } = options;
		value = this._prepareValueBeforeSet(value, { key });
		const resolve = Promise.resolve(value);
		if (this.isSameControlValue(value)) { return resolve; }

		this._cntrl.notValidated = value;

		if (notValidated) { return resolve; }
		return this._setControlValue(value, options);
	},

	_prepareValueBeforeSet(value, { key } = {}){
		value = this.prepareValueBeforeSet(value);
		if (key == null) { return value; }

		let current = this.getControlValue({ notValidated: true, clone: true }) || {};
		setByPath(current, key, value);
		return current;
	},

	//override this if you need modify value before set
	prepareValueBeforeSet: value => value,

	_setControlValue(value, options = {}) {
		let { skipValidation } = options;
		if (skipValidation) {
			return this._onSetControlValueValidateSuccess(value, options);
		}
		return this._validate(value, options)
			.then(
				() => this._onSetControlValueValidateSuccess(value, options), 
				error => this._onSetControlValueValidateFail(error, value, options)
			);
	},
	_onSetControlValueValidateSuccess(value, options){
		this._cntrl.previous = this._cntrl.value;
		this._cntrl.value = value;
		this._cntrl.isDone = false;
		this._tryTriggerEvent('change', [value], options);
		return Promise.resolve(value);
	},
	_onSetControlValueValidateFail(error, value, options){
		this._tryTriggerEvent('change:fail', [value, error], options);
		return ensureError(error, value);
	},

	isValid(){
		return this._cntrl.isValid !== false;
	},
	validate(options = {}){

		let notValidated = !this.isValid();
		let value = this.getControlValue({ notValidated });
		let promise = this._validate(value, options);
		let _catch = options.catch;

		if (_catch === false) {
			return promise;
		} else if(_.isFunction(_catch)) {
			return promise.catch(_catch);
		} else {
			return promise.catch(ensureError);
		}
	},
	_validate(value, options){

		//let validate = this._validateControl(value, options);
		let validate = this._validatePromise(value, options);

		return validate.then(
			() => this._onControlValidateSuccess(value, options),
			error => this._onControlValidateFail(error, value, options)
		);
	},
	_validateControlPromise(value, options){
		let validate = this.getOption('controlValidate', { force: false });
				
		//if there is no validation defined, resolve
		if (!_.isFunction(validate)) {
			
			return Promise.resolve(value);
		}

		let values = this.getParentControlValue({ notValidated: true });
		let validateResult = validate.call(this, value, values, options);

		let promise = Promise.resolve(value);
		if (validateResult && validateResult.then) {
			promise = validateResult;
		} else if (validateResult) {
			promise = Promise.reject(validateResult);
		}
		return promise;
	},


	_validateChildrenControlsPromise({ isControlWrapper, skipChildValidate} = {}, errors = {}){

		let children = this.getChildrenControls();
		let childrenPromise = Promise.resolve();
		if (!children.length) return childrenPromise;

		return _.reduce(children, (finaly, child) => {
			let control = child.getControlName();

			finaly = finaly.then(() => {

				if (!child.validate || (skipChildValidate && control == skipChildValidate)) {
					return Promise.resolve();
				}
				let validateResult = child.validate({ stopPropagation: true, catch: false });

				return validateResult;
			}).catch(error => {

				if(isControlWrapper){
					errors.wrapped = error;
				} else {
					errors.children[control] = error;
				}
				return Promise.resolve();
			});
			return finaly;
		}, childrenPromise);		

	},

	_validatePromise(value, options){
		
		const { skipChildValidate } = options;
		const isControlWrapper = betterResult(this, 'isControlWrapper', { args:[this]});

		
		return new Promise((resolve, reject) => {
			let childrenErrors = {
				children: {}
			};
			let childrenPromise = this._validateChildrenControlsPromise({ skipChildValidate, isControlWrapper }, childrenErrors);

			childrenPromise.then(() => {

				if (_.size(childrenErrors.children)) {
					reject(childrenErrors.children);
					return;
				} else if (childrenErrors.wrapped) {
					reject(childrenErrors.wrapped);
					return;
				}
			
				let promise = this._validateControlPromise(value, options);

				promise.then(
					() => {
						resolve(value);
					},
					error => {
						reject(error);
					}
				);

			});
		});		
	},



	_onControlValidateSuccess(value, options){
		this.makeValid(value, options);
		return Promise.resolve(value);
	},
	makeValid(value, options){
		this._cntrl.isValid = true;
		if(!this.isSameControlValue(value)){
			this._setControlValue(value, { silent: true, skipValidation: true });
		}
		this._tryTriggerEvent('valid', [value], options);
	},

	_onControlValidateFail(error, value, options){
		this.makeInvalid(error, value, options);
		return Promise.reject(error);
	},
	makeInvalid(error, value, options){
		this._cntrl.isValid = false;
		this._tryTriggerEvent('invalid', [value, error], options);
	},

	getParentControl() {
		return this._cntrl.parent;
	},
	getParentControlValue(options) {

		let parent = this.getParentControl();
		if (!parent || !_.isFunction(parent.getControlValue)) {
			return;
		}
		if (betterResult(parent, 'isControlWrapper', { args:[this]})) {
			return parent.getParentControlValue(options);
		} else {
			return parent.getControlValue(options);
		}
	},
	getChildrenControls(){
		if(!this._cntrl.children) {
			this._cntrl.children = [];
		}
		return this._cntrl.children;
	},
	handleChildControlEvent(event, controlName, ...args) {
		let childEvent = controlName + ':' + event;
		let trigger = getTriggerMethod(this);
		trigger.call(this, childEvent, ...args);

		let cce = this.getOption('childControlEvents', { args: [this] }) || {};
		let def = this.defaultChildControlEvents || {};
		if(!this._debouncedChildControlEvents) {
			this._debouncedChildControlEvents = {};
		}
		let dcce = this._debouncedChildControlEvents;

		let defHandler = def[event];
		let handler = cce[childEvent];
		let handlerArguments = [];
		let handlerName;
		if (_.isFunction(handler)) {
			handlerArguments = args;
			handlerName = childEvent;
			//handler.apply(this, args);
		} else if(_.isFunction(defHandler)){
			handlerName = '_default:' + event;
			handler = defHandler;
			handlerArguments = [controlName, ...args];
		} else {
			return;
		}
		
		let delay = this.getOption('debounceChildControlEvents');
		if(_.isNumber(delay) && delay > 0){
			if(!dcce[handlerName]){
				dcce[handlerName] = _.debounce(handler, delay);
			}
			handler = dcce[handlerName];
		}

		handler.apply(this, handlerArguments);

	},
	defaultChildControlEvents:{
		'change'(controlName, value){
			let isControlWraper = this.getOption('isControlWrapper');
			isControlWraper && (controlName = undefined);
			this.setControlValue(value, { key: controlName, skipChildValidate: controlName });
		},
		'done'(controlName, value){
			let isControlWraper = this.getOption('isControlWrapper');
			isControlWraper && (controlName = undefined);
			this.setControlValue(value, { key: controlName, skipChildValidate: controlName });
			if(isControlWraper) {
				this.controlDone();
			}
		},
		'invalid'(controlName, value, error){
			if(this.getOption('isControlWrapper')){
				controlName = undefined;
			}
			this.setControlValue(value, { key: controlName, silent: true, notValidated: true });
			this.makeInvalid(error, this.getControlValue({ notValidated: true }));
		},
	},

	controlDone(){
		if (!this._cntrl.isValid || this._cntrl.isDone) { return; }
		let value = this.getControlValue();
		this._cntrl.isDone = true;
		this._tryTriggerEvent('done', [value]);
	},


	/*
		helpers
	*/
	_clone(value){
		if(_.isArray(value))
			return value.slice(0);
		else if(_.isObject(value)) {
			return unFlat(flattenObject(value));
		} else
			return value;
	},
	_tryTriggerEvent(name, args = [], { silent, stopPropagation } = {}){
		if (silent) { return; }
		let controlName = this.getControlName();
		let event = 'control:' + name;
		let namedEvent = controlName + ':' + name;

		let trigger = getTriggerMethod(this);
		
		trigger.call(this, event, ...args);

		let parent = this.getParentControl();
		if (stopPropagation || !parent) { return; }
		if (_.isFunction(parent.handleChildControlEvent)) {
			parent.handleChildControlEvent(name, controlName, ...args);
		} else {
			let parentTrigger = getTriggerMethod(parent);
			parentTrigger.call(parent, namedEvent, ...args);
		}

	},
	makeControlReady(){
		let trigger = getTriggerMethod(this);
		trigger.call(this, 'control:ready');
	},

}, { ControlMixin: true });

var customs$1 = Base => Base.extend({
	
	renderAllCustoms: false,
	shouldMergeCustoms: false,
	renderCollection: true,

	constructor(){
		this._customs = [];		
		Base.apply(this, arguments);
		if (this.getOption('renderCollection') === false && this.collection) {
			this._collection = this.collection;
			delete this.collection;
		}
		this._initializeCustoms();
	},
	getCollection(){
		return this.collection || this._collection;
	},
	_initializeCustoms(){

		let optionsCustoms = betterResult(this.options, 'customs', { args: [this], context: this });
		let instanceCustoms = betterResult(this, 'customs', { args: [this] });
		let shouldMergeCustoms = this.getOption('shouldMergeCustoms');
		let add;
		if (shouldMergeCustoms) {
			add = (instanceCustoms || []).concat(optionsCustoms || []);			
		} else {
			add = instanceCustoms || optionsCustoms || [];
		}
		this._customs.push(...add);

		if (this.getOption('renderAllCustoms')) {
			this.on('render', this._renderCustoms);
		}
	},
	renderCustoms(){
		this.triggerMethod('before:customs:render');

		_.each(this._renderedCustoms, view => view.destroy());
		
		let customs = this.getCustoms();
		
		this._renderedCustoms = this.addChildViews(customs);

		this.triggerMethod('customs:render');
	},
	_renderCustoms(){
		if (!this.getOption('renderAllCustoms')) return;
		this.renderCustoms();
	},
	getCustoms() {		
		return this._prepareCustoms(this._customs.slice(0));
	},
	_prepareCustoms(rawcustoms){
		return _.reduce(rawcustoms, (array, item) => {
			let args = this._prepareCustom(item);
			args && (args = this.buildCustom(...args));
			args && array.push(args);
			return array;
		},[]);
	},
	_prepareCustom(arg){
		if (_.isFunction(arg)) {
			return this._prepareCustom(arg.call(this, this));
		} else if (_.isArray(arg)) {
			return arg;
		} else {
			return [arg, { index: 0 }];
		}
	},
	buildCustom(view, options = {}){ 
		if (isViewClass(view)) {
			let childOptions = this.getOption('customViewOptions');
			view = new view(childOptions);
		} else if (_.isFunction(view)) {
			view = view.call(this, this);
		} else if(!isView(view) && _.isObject(view) && 'view' in view) {
			if(isView(view.view)) {
				if(_.isObject(view.options))
					options = view.options;
				view = view.view;
			} else if(isViewClass(view.view)) {
				let viewOptions = view.options;
				view = new view.view(viewOptions);
			}
		}
		if (isView(view)) {
			this._setupCustom(view);
			return [view, options]; 
		}
	},
	_setupCustom(view){
		this.setupCustom(view);
	},
	setupCustom: _.noop,
	addChildViews(children = []){
		if (!children.length) { return; }

		let awaitingRender = false;
		let rendered = [];
		while(children.length) {

			let args = children.pop();
			if (!args) { continue; }

			if (!_.isArray(args)) {
				args = [args, { index: 0 }];
			}

			let [ view, index, options = {} ] = args;
			if (_.isObject(index)) {
				options = index;
				index = undefined;
			}
			if (index != null && !('index' in options)) {
				options.index = index;
			}
			options.preventRender = !!children.length;
			if (!isView(view)) { continue; }

			this.addChildView(view, options);
			rendered.push(view);
			awaitingRender = options.preventRender;
		}
		if (awaitingRender) {
			this.sort();
		}
		return rendered;
	},
}, { CustomsMixin: true });

var TextView = Backbone.View.extend({
	supportsDestroyLifecycle: true,

	constructor({ text } = {}){
		Backbone.View.apply(this, arguments);
		this.setText(text);
	},
	render(){
		this.$el.html(this.text);
		this._isRendered = true;
		return this;
	},
	isRendered(){
		return this._isRendered === true;
	},
	setText(text){
		this.text = text;
		if(this.isRendered()) {
			this.render();
		}
	},
	triggerMethod,
	destroy(){
		if(this._isDestroyed || this._isDestroying) { return; }
		this._isDestroying = true;

		this.triggerMethod('before:destroy', this);
		
		if (this._isAttached) {
			this.triggerMethod('before:detach', this);
		}
		
		this.remove();
		
		if (this._isAttached) {
			this._isAttached = false;
			this.triggerMethod('detach', this);
		}
		
		this._isDestroyed = true;
	
		this.triggerMethod('destroy', this);
	}
});

//import { isView, isViewClass } from '../../../vendors/helpers.js';
var ControlView = Base => {
	let Mixed = Base;

	if (!Mixed.ControlMixin) {
		Mixed = ControlMixin(Mixed);
	}

	if (!Mixed.CssClassModifiersMixin) {
		Mixed = cssClassModifiers(Mixed);
	}

	if (!Mixed.CustomsMixin) {
		Mixed = customs$1(Mixed);
	}


	return Mixed.extend({

		renderAllCustoms: true,
		isControlWrapper: true,
		skipFirstValidationError: true,
		shouldShowError: false,
		validateOnReady: false,
		
		constructor(){
			Mixed.apply(this, arguments);
			if(!this.cssClassModifiers) {
				this.cssClassModifiers = [];
			}
			this._setControlValidInvalidListeners();
			this.addCssClassModifier('control-wrapper');
		},	
		_setControlValidInvalidListeners(){
			if(this._controlValidInvalidListeners) { return true; }

			this.on({
				'control:valid': this._onControlValid,
				'control:invalid': this._onControlInvalid
			});
			if(this.getOption('validateOnReady')){
				this.once('customs:render', () => this.makeControlReady());
			}			

			this._controlValidInvalidListeners = true;
		},
		getCustoms(){
			let customs = [];
			if (this.getOption('isControlWrapper')) {
				customs.push(this.getControlView());
			} else {
				customs.push(...this._customs);
			}
			customs = this.injectSystemViews(customs);
			return this._prepareCustoms(customs);
		},
		_setupCustom(view){
			this._setupChildControl(view);
			this.setupCustom(view);
		},
		_setupChildControl(view){
			if(_.isFunction(view.setParentControl)) {
				view.setParentControl(this);
			}
			this.setupChildControl(view);
		},
		setupChildControl: _.noop,
		injectSystemViews(customs = []){
			customs.unshift(this.getHeaderView());
			customs.push(
				this.getErrorView(),
				this.getFooterView()	
			);
			return customs;
		},

		buildTextView(text, tagName){
			let View$$1 = this.getOption('textView');
			if (!View$$1) { return; }
			return new View$$1({ text, tagName });
		},



		getErrorView(){
			if (!this.getOption('shouldShowError')) { return; }
			if (this.getOption('showValidateError', {force:false})) { return; }
			this._errorView = this.buildErrorView();
			return this._errorView;
		},
		buildErrorView(){
			return buildViewByKey.call(this, 'errorView');
		},



		getHeaderView(){			
			return this.buildHeaderView({ tagName: 'header' });
		},
		buildHeaderView(options){
			return buildViewByKey.call(this, 'header', { TextView, options });
		},



		getFooterView(){
			if (this.getOption('buttonsInFooter')) {
				return this.buildButtonsView();
			} else {
				return this.buildFooterView();
			}
		},

		buildFooterView(){
			return buildViewByKey.call(this, 'footer', { TextView, options: { tagName: 'footer' }});
		},

		buildButtonsView(){
			if (this._buttonsView) {
				this.stopListening(this._buttonsView);
			}

			let options = this.buildButtonsOptions();
			let view = buildViewByKey.call(this, 'buttonsView', { options });
			if (!view) { return; }

			this._buttonsView = view;
			this.settleButtonsListeners(view);

			return view;
		},
		buildButtonsOptions(){
			let btns = this.getOption('buttons');
			if(btns) {
				return _.reduce(btns, (hash, b) => {
					let item = this.buildButton(b, this);
					hash[item.name] = item;
					return hash;
				}, {});
			}		
		},
		buildButton(value){
			if (_.isString(value)) {
				return this.buildButton({ text: value, className: value, name: value });
			} else if(_.isFunction(value)) {
				return this.buildButton(value.call(this));
			} else if(_.isObject(value)) {
				return this.fixButton(value);
			}
		},
		fixButton(button){
			return button;
		},
		settleButtonsListeners(buttonsView){
			this.listenTo(buttonsView, {
				'resolve'(){
					this.triggerMethod('resolve', this.getControlValue());
				},
				'reject'(){
					this.triggerMethod('reject');
				},
				'reject:soft'(){
					this.triggerMethod('reject:soft');
				},
				'reject:hard'(){
					this.triggerMethod('reject:hard');
				},
			});
		},

		getControlView(){
			this.control = buildViewByKey.call(this, 'controlView', { options: { parentControl: this, value: this.getControlValue() } });
			return this.control;
		},


		_onControlInvalid(value, error){
			this.disableButtons();
			this._showValidateError(error);
		},
		_onControlValid(){
			this.enableButtons();
			this._hideValidateError();
		},
		
		disableButtons(){
			if(this._buttonsView && _.isFunction(this._buttonsView.disableButton)) {
				this._buttonsView.disableButton('resolve');
			}
		},
		enableButtons(){
			if(this._buttonsView && _.isFunction(this._buttonsView.enableButton)) {
				this._buttonsView.enableButton('resolve');
			}
		},
		_showValidateError(error){
			
			let shouldShow = this.getOption('shouldShowError');
			let skipFirstValidationError = this.getOption('skipFirstValidationError');

			if (skipFirstValidationError && !this._firstValidationErrorSkipped) {
				this._firstValidationErrorSkipped = true;
				return;
			}

			if (!shouldShow) return;

			let show = this.getOption('showValidateError', { force: false });
			if (_.isFunction(show)) {
				show.call(this, error);
			} else {
				if (!this._errorView) return;
				this._errorView.showError(error);
			}		
		},
		_hideValidateError(){
			let hide = this.getOption('hideValidateError', { force: false });
			if (_.isFunction(hide)) {
				hide.call(this);
			} else {
				if (!this._errorView) return;
				this._errorView.hideError();
			}		
		},
	}, { ControlViewMixin: true });


};

//import getOption from '../../../utils/get-option';
const _getOption = (context, key, checkAlso) => getOption(context, key, { args:[context], checkAlso });

function getInputType(inputView, opts = {}){
	
	let valueType = _getOption(inputView, 'valueType', opts);
	if (valueType == null) {
		let value = inputView.getControlValue();
		if ( value == null) {
			valueType = 'string';
		} else {
			if(_.isNumber(value))
				valueType = 'number';
			else if(_.isDate(value))
				valueType = 'datetime';
			else
				valueType = 'string';
		}		
	}

	if (valueType == 'number') {
		inputView._valueIsNumber = true;
	}

	let type = _getOption(inputView, 'inputType', opts);
	if(type == null){
		type = _getOption(inputView.valueOptions, 'inputType', opts.valueOptions);
	}
	if (!type) {
		if (inputView._valueIsNumber) {
			type = _getOption(inputView, 'inputNumberType', opts) || 'number';
		} else if (valueType == 'string') {
			type = 'text';
		} else if (valueType == 'datetime') {
			type = 'datetime';
		} else {
			type = 'text';
		}
	}
	inputView.inputType = type;
	inputView.valueType = valueType;
	return type;
}

//import getOption from '../../../utils/get-option';
function setInputAttributes(inputView, opts = {}) {

	let attributes = getOption(inputView, opts, 'attributes');

	let check = _.extend({}, inputView, opts, inputView.valueOptions, opts.valueOptions);

	let restrictionKeys = {
		'maxLength':'maxlength', 
		'minLength':'minlength',
		'minValue':'min', 
		'maxValue':'max', 
		'valuePattern':'pattern',
		'required':'required',
		'value':'value'
	};
	let restrictions = {};
	_(restrictionKeys).each((key2, key) => {
		let value = check[key];
		//getOption(inputView, opts, key);
		if (value != null)
			restrictions[key2] = value;
	});

	inputView.attributes = _.extend({
		value: inputView.value,
		type: getInputType(inputView, opts),
	}, restrictions, attributes);
	
	if(opts.attributes)
		delete opts.attributes;
}

var getOption$1 = (context, key, ifNull) => getOption(context, key, { args:[context], default: ifNull });

function isChar(event){
	return event.key && event.key.length == 1 && !event.ctrlKey;
}

function keydown(eventContext) {
	let { context, event } = eventContext;

	if (context.triggerMethod('keydown', event) === false) { return; }


	let prevent = false;
	let stop = false;

	if (isChar(event)) {
		if (!context.isEnteredCharValid(event.key)) {
			prevent = true;
		}
	}
	if(event.keyCode == 13 && getOption$1(context, 'doneOnEnter', true)){
		prevent = true;
		stop = true;
	}

	stop && event.stopPropagation();
	prevent && event.preventDefault();
}

function keyup(eventContext) {
	let { context, event } = eventContext;

	if (context.triggerMethod('keyup', event) === false) { return; }

	if (event.keyCode == 13) {
		
		let shouldDone = getOption$1(context, 'doneOnEnter', true);
		if (shouldDone) {

			event.stopPropagation();
			event.preventDefault();
			context.controlDone();

		}

	}


}

function paste(eventContext) {
	let { context, event } = eventContext;

	
	if (context.triggerMethod('paste', event) === false) { return; }


	let text = event.originalEvent.clipboardData.getData('text/plain');
	if (!text) return;
	if (!context.isValueValid(text)) {
		event.preventDefault();
		event.stopPropagation();
	}
}

function blur(eventContext) {
	let { context } = eventContext;

	if (context.triggerMethod('blur', event) === false) { return; }


	if (getOption$1(context, 'doneOnBlur', true)) {
		context.controlDone();
	}
}

function focus(eventContext) {
	let { context, input } = eventContext;

	if (context.triggerMethod('focus', event) === false) { return; }

	if (getOption$1(context, 'selectOnFocus', true)) {
		input.select();
	}
}

function input(eventContext) {

	let { context, input, event } = eventContext;

	if (context.triggerMethod('input', event) === false) { return; }


	context.setControlValue(event.target.value).then(newvalue => {
		if (event.target.value != (newvalue || '').toString()) {
			input.value = newvalue;
		}
	});
	//context.triggerControlChange();
}

//import jsChange from './js-change';
var eventHandlers = {
	keydown, 
	//keypress,
	keyup,
	paste,
	blur,
	focus,
	input,
	//'js:change': jsChange
};

function handleInputEvent(control, eventName, event) {
	let options = _.extend({
		context: control,
		input: control.el,
		restrictions: control.restrictions,
		eventName,
		event
	});


	let method = camelCase(`on:dom:${eventName}`);

	if (_.isFunction(eventHandlers[eventName])) {
		eventHandlers[eventName].call(control, options);
	} 
	
	if (_.isFunction(control[method])) {
		control[method](event, options);
	} 
}

const _getOption$1 = (context, key, checkAlso) => 
	getOption(context, key, { args:[context], checkAlso });

function setInputEvents(inputView, opts = {}) {

	let passedEvents = _getOption$1(inputView, 'events', opts);	

	let eventsArray = _(eventHandlers).keys();	
	let events = _.reduce(eventsArray, (Memo, eventName) => {
		Memo[eventName] = function(event){ 
			handleInputEvent(this, eventName, event); 
		};
		return Memo;
	}, {});
	inputView.events = _.extend(events, passedEvents);
}

//import { convertString as convert, getOption } from '../../../utils/index.js';
var index$12 = Base => {

	let Mixin = Base.ControlMixin ? Base : ControlMixin(Base);

	return Mixin.extend({
		constructor(opts){
			
			this._initControl(opts);

			setInputAttributes(this, opts);
			setInputEvents(this, opts);
			Mixin.apply(this, arguments);

			if (!_.isFunction(this.getOption)) {
				this.getOption = _.partial(getOption, this, _, { args: [this]});
			}

			this.buildRestrictions();
			let value = this.getOption('value') || '';			
			this.el.value = value;
			//this.setControlValue(value, { trigger: false, silent: true });
		},
		tagName:'input',
		template: false,
		doneOnEnter: true,
		doneOnBlur: true,
		buildRestrictions(){
			let attrs = _.result(this, 'attributes');
			let pickNumbers = ['maxlength', 'minlength', 'min', 'max'];
			let pickStrings = ['pattern'];
			let pickBools = ['required'];
			let restrictions = {};
			_(attrs).each((value, key) => {
				let pick = false;
				key = key.toLowerCase();
				if (pickNumbers.indexOf(key) > -1) {
					value = convertString(value, 'number');
					pick = true;
				} else if (pickStrings.indexOf(key) > -1) {
					pick = true;
				} else if (pickBools.indexOf(key) > -1) {
					pick = true;
					value = convertString(value, 'boolean', { returnNullAndEmptyAs: true, returnOtherAs: true });
				}
				pick && (restrictions[key] = value);
			});
			this.restrictions = restrictions;		
		},
		prepareValueBeforeSet(value){
			if (value == null || value === '') return value;
			
			let len = this.getMaxLength();
			if (len > 0) {
				value = value.toString().substring(0, len);
			}
			if (this._valueIsNumber) {
				let num = convertString(value, 'number');
				if(isNaN(num))
					return;
				let min = this.restrictions.min;
				let max = this.restrictions.max;
				!isNaN(min) && num < min && (num = min);
				!isNaN(max) && num > max && (num = max);
				return num;
			}
			return value;
		},
		getValueType(){
			return this.valueType;
		},
		convertValue(value){
			return convertString(value, this.getValueType());
		},		
		getMaxLength()
		{
			return this.restrictions.maxlength;

		},
		isLengthValid(){
			let value = this.getControlValue();
			let len = this.getMaxLength();
			return len == null || value.length < len;
		},
		isEnteredCharValid(char) {
			let type = this.getValueType();

			if (type == 'number') {
				return ['.','-'].indexOf(char) > -1 || !isNaN(parseInt(char, 10));
			} else {
				return true;
			}
		},
		isValueValid(value){
			let type = this.getValueType();
			if (type == 'number') {
				return !isNaN(parseFloat(value, 10));
			} else {
				return true;
			}
		},
		controlValidate(value){
			if (value == null || value === '') {
				if(this.restrictions.required)
					return 'required';
				else if (this.restrictions.minLength > 0) {
					return 'length:small';
				}
				else
					return;
			}
			let strValue = value.toString();
			if (_.isNumber(this.restrictions.maxlength) && strValue.length > this.restrictions.maxlength)
				return 'length:big';
			if (this._valueIsNumber) {
				if (!_.isNumber(value))
					return 'not:number';
				if (_.isNumber(this.restrictions.min) && value < this.restrictions.min)
					return 'less:than:min';
				if (_.isNumber(this.restrictions.max) && value > this.restrictions.max)
					return 'greater:than:max';
			}
			if (this.restrictions.pattern) {
				let pattern = RegExp(this.restrictions.pattern);
				if (pattern.test(strValue)) {
					return 'pattern:mismatch';
				}
			}
		}
	});
};

var index$13 = Base => Base.extend({
	constructor(options){
		if (!this.cssClassModifiers) {
			this.cssClassModifiers = [];
		}
		this._buttons = {};
		Base.apply(this, arguments);
		this.addPromiseBarCssClass();
		this.mergeOptions(options, ['promise', 'reject', 'resolve', 'beforeRejectSoft', 'beforeRejectHard', 'beforeResolve']);
	},
	className:'promise-bar',
	tagName: 'footer',
	resolve:'ok',
	triggerNameEvent: true,
	addPromiseBarCssClass(){
		this.cssClassModifiers.push('promise-bar');
	},
	onRender(){
		this.addButtons();
	},
	addButtons(){
		let buttons = this.buildButtons() || [];
		while (buttons.length){
			let button = buttons.pop();
			let preventRender = !!buttons.length;
			this.addChildView(button, { preventRender });
		}
	},
	buildButtons(){
		let names = ['resolve','rejectSoft','rejectHard'];
		return _.reduce(names, (buttons, name) => {
			let button = this.buildButton(name);
			button && buttons.push(button);
			return buttons;
		}, []);
	},
	buildButton(name){
		let options = this.getButtonOptions(name);
		if (!options) return;
		let Button = this.getOption('buttonView');
		let btn = new Button(options);
		this._buttons[name] = btn;
		return btn;
	},
	getButtonOptions(name){
		let options = this.getOption(name);
		if ( !options ) return;
		if( _.isString(options) ) {
			options = { text: options };
		} else if(!_.isObject(options)) {
			return;
		}
		let defs = { 
			className: name, 
			name, 
			triggerNameEvent: this.getOption('triggerNameEvent'), 
			stopEvent: true,
			text: options.text || name,
		};
		options = _.extend(defs, options);
		return options;
	},
	childViewEvents:{
		'click:resolve'(data){
			this.triggerMethod('resolve', data);
		},
		'click:rejectSoft'(value){ 
			this.triggerMethod('reject', { type: 'soft', value });
			this.triggerMethod('reject:soft', value);
		},
		'click:rejectHard'(value){ 
			this.triggerMethod('reject', { type: 'hard', value });
			this.triggerMethod('reject:hard', value);
		},
		'click:fail'(error, name, event, view) {
			this.triggerMethod('click:fail', error, name, event, view);
			if (name) {
				this.triggerMethod(`click:${name}:fail`, error, event, view);
			}
		}
	},

	disableButton(name){
		let btn = this._buttons[name];
		btn && btn.disable();
	},
	enableButton(name){
		let btn = this._buttons[name];
		btn && btn.enable();
	},

});

const rules = [
	{
		name: 'required',
		message: 'required',
		validate: (value) => {
			if (isEmptyValue(value)) {
				return 'required';
			}
		}
	},
	{
		name: 'email',
		message: 'not a email',
		validate: (value) => {
			
			if(isEmptyValue(value)) { return; }

			if (!_.isString(value)) {
				return 'type:mismatch';
			}

			let chunks = value.split('@');
			let left = chunks[0];
			let right = chunks[1];
		
			if(
				chunks.length != 2
				|| !/^[a-z0-9\-_.+]+$/gmi.test(left)
				|| !/^[a-z0-9\-_]+\.[a-z0-9\-_]+(\.[a-z0-9\-_]+)*$/gmi.test(right)
			) {
				return 'pattern:mismatch';
			} else {
				return;
			}
		}
	},
	{
		name:'valueIn',
		message: 'given value is not one of allowed values',
		validate: (value, { valueIn } = {}) => {
			if(_.isArray(valueIn) && valueIn.indexOf(value) === -1) {
				return 'value:not:in';
			}
		}
	},
	{
		name:'valueNotIn',
		message: 'given value is one of forbiden values',
		validate: (value, { valueNotIn } = {}) => {
			if(_.isArray(valueNotIn) && valueNotIn.indexOf(value) > -1) {
				return 'value:in';
			}
		}
	},
	{
		name:'shouldBeEqual',
		message: 'given value is not equal',
		validate: (value, { shouldBeEqual, allValues } = {}) => {
			
			let compare = _.isFunction(shouldBeEqual) 
				? shouldBeEqual(allValues) 
				: shouldBeEqual;

			if (value !== compare) {
				return 'value:not:equal';
			}
		}
	},	
	{
		name:'shouldNotBeEqual',
		message: 'given value is forbiden',
		validate: (value, { shouldNotBeEqual, allValues } = {}) => {

			let compare = _.isFunction(shouldNotBeEqual) 
				? shouldNotBeEqual(allValues) 
				: shouldNotBeEqual;

			if (value !== compare) {
				return 'value:equal';
			}


			if(_.isFunction(shouldNotBeEqual)) {
				return value !== shouldNotBeEqual(allValues);
			} else {
				return value !== shouldNotBeEqual;
			}
		}
	},
	{
		name:'minLength',
		message: ({ ruleValue } = {}) => 'length is less than ' + ruleValue,
		validate: (value, { minLength } = {}) => {
			if (_.isNumber(minLength) && (value || '').toString().length < minLength) {
				return 'min:length';
			}
		}
	},
	{
		name:'maxLength',
		message: ({ ruleValue } = {}) => 'length is greater than ' + ruleValue,
		validate: (value, { maxLength } = {}) => {
			if (_.isNumber(maxLength) && (value || '').toString().length > maxLength) {
				return 'max:length';
			}
		}
	},
	{
		name:'minValue',
		message: ({ ruleValue } = {}) => 'value is less than ' + ruleValue,
		validate: (value, { minValue } = {}) => {
			if (_.isNumber(minValue)) {
				let numValue = parseFloat(value, 10);
				if (isEmptyValue(numValue) || numValue < minValue) {
					return 'min:value';
				}
			}
		}
	},
	{
		name:'maxValue',
		message: ({ ruleValue } = {}) => 'value is greater than ' + ruleValue,
		validate: (value, { maxValue } = {}) => {
			if (_.isNumber(maxValue)) {
				let numValue = parseFloat(value, 10);
				if (isEmptyValue(numValue) || numValue > maxValue) {
					return 'max:value';
				}
			}			
		}
	},
	{
		name:'pattern',
		message: 'value is not in pattern',
		validate: (value, { pattern } = {}) => {
			value = (value || '').toString();

			if(_.isString(pattern) && !isEmptyValue(pattern)) {
				pattern = new RegExp(pattern);
			}
			if(!_.isRegExp(pattern)) { return; }

			if (!pattern.test(value)) {
				return 'pattern';
			}
		}
	},
	{
		name: 'validate',
		validate: (value, options = {}) => {
			let { ruleValue } = options;
			if(!_.isFunction(ruleValue)) return;
			return ruleValue(value, options);
		},
	},	
];

reIndex(false);

function reIndex(sortBefore = true) {
	if (sortBefore) {
		rules.sort((a,b) => a.index - b.index);
	}
	_.each(rules, (rule, index) => {
		rule.index = index;
	});
}

function normalizeValidationContext(context){
	if (context === 'required') {
		return { required: true };
	} else if(_.isFunction(context)) {
		return { validate: context };
	} else if(_.isObject(context)) {
		return context;
	}
}

function getRuleContexts(rule = {}){
	let founded = _.reduce(rule, (taken, ruleValue, name) => {
		let found = _.findWhere(rules, { name });
		if(!found) return taken;

		let message = rule[name + 'Message'];
		taken.push({
			rule: found,
			ruleValue,
			message,
			index: found.index
		});

		return taken;

	}, []);
	founded.sort((a,b) => a.index - b.index);
	return founded;
}

function check(value, ruleContext = {}) {
	
	let { rule = {}, ruleValue, allValues, errors = [] } = ruleContext;
	if (rule.skipIfInvalid && errors.length) {
		return Promise.reject();
	}
	let message = ruleContext.message || rule.message;
	let buildMessage = _.isFunction(message) ? message : ({ error } = {}) => isEmptyValue(message) ? error : message;

	let validate = rule.validate;
	let validateOptions = {
		ruleName: rule.name,
		ruleValue,
		[rule.name]: ruleValue,
		allValues,
		message: buildMessage({ value, allValues, ruleValue }),
		errors,
	};
	if (!_.isFunction(validate)) return Promise.resolve(value);

	
	let result = validate(value, validateOptions);

	if (!result) {
		return Promise.resolve(value);
	} else if(result && _.isFunction(result.then)) {
		return result.then(
			() => Promise.resolve(value),
			(error) => Promise.reject(buildMessage({ error, value, allValues, ruleValue }))
		);
	} else {
		return Promise.reject(buildMessage({ error: result, value, allValues, ruleValue }));
	}
}



function validate(value, rule, { allValues = {} } = {}){
	rule = normalizeValidationContext(rule);
	let contexts = getRuleContexts(rule);
	

	return new Promise((resolve, reject) => {
		let errors = [];

		let rulesPromise = _.reduce(contexts, (promise, ruleContext) => {

			promise = promise.then(() => {
				return check(value, _.extend({}, ruleContext, { allValues, errors }));
			}).catch(error => {
				if(error != null)
					errors.push(error);
			});

			return promise;

		}, Promise.resolve(value));

		rulesPromise.then(() => {
			if(errors.length){
				reject(errors);
			} else {
				resolve(value);
			}
		});

	});
}

function removeRule(name){
	let found = _.findIndex(rules, { name });
	if (found === -1) return;
	let removed = rules.splice(found, 1);
	reIndex();
	return removed;
}

function setRule(rule){
	if (rule.index == null) {
		rule.index = rules.length;
	}
	rules.push(rule);
	reIndex();
	return rule;
}

var validator = {
	setRule(name, rule = {}){
		if(_.isObject(name)) {
			rule = name;
			name = rule.name;
		}

		if(isEmptyValue(name)) {
			throw new Error('rule name not specified');
		}

		if(rule == null){
			return removeRule(name);
		} else if (!_.isObject(rule)) {
			throw new Error('validation rule must be an object');
		} else {
			if (rule.name != name) {
				rule.name = name;
			}
			return setRule(rule);
		}
	},
	removeRule(name) {
		return removeRule(name);
	},
	getRule(name){
		return _.findWhere(rules, { name });
	},
	setMessage(name, message){
		if(!_.isString(name) || isEmptyValue(name)) {
			throw new Error('name must be not empty string');
		}
		if(!(_.isString(message) || _.isFunction(message))) {
			throw new Error('message must be not empty string or a function returning a string');
		}
		let rule = _.findWhere(rules, { name });
		if (!rule) { return; }
		rule.message = message;
	},
	setMessages(hash = {}){
		_.each(hash, (message, name) => this.setMessage(name, message));
	},
	validate,
	_rules: rules,
};

var common$1 = {
	_createSchema(){
		let schema = this.getOption('schema', { args: [ this.model, this ] });
		let Schema = this.getSchemaClass();

		if(schema instanceof Schema){
			return schema;
		}

		
		if(schema == null || _.isObject(schema)) {
			return this.createSchema(Schema, schema);
		}
		
	},
	getSchema(){
		if(this._schema) { return this._schema; }
		
		this._schema = this._createSchema();
		return this._schema;
	},
	createSchema(Schema, options = {}){
		return new Schema(options);
	},
	getSchemaClass(){
		return this.getOption('schemaClass');
	},
};

const Schema = Mixin(BaseModel);

var PropertySchema = Schema.extend({
	constructor(options = {}){
		Schema.apply(this, arguments);
		let { name, property, modelSchema, order = 0 } = options;
		this.name = name;
		this.schema = _.extend({}, property);	
		this.modelSchema = modelSchema;
		if (this.schema.order != null)
			order = this.schema.order;
		this.order = order;
	},
	_getByKey(key, options = {}){
		let hash = betterResult(this.schema, key, { args: [options], default: {} });
		return unFlat(flattenObject(hash));
	},
	getValidation(options) {
		return this._getByKey('validation', options);
	},
	getType(options) {
		let type = this._getByKey('value', options);
		if(!('multiple' in type)) {
			type.multiple = false;
		}
		return type;
	},
	getDisplay(options){
		return this._getByKey('display', options);
	},
	getLabel(value, allValues){
		let label = this.getDisplay().label;
		return betterResult({ label },'label', { args: [value, allValues] });
	},
	getEdit(options = {}){
		let valueOptions = this.getType(options);
		let editOptions = this._getByKey('edit', options);
		let label = this.getLabel(options.value, options.allValue);
		let compiled = _.extend({ name: this.name, label }, options, { valueOptions, editOptions });
		return compiled;
	},
});

var EditProperty = Base => {
	const Mixed = mix(Base).with(ControlView, common$1);

	return Mixed.extend({
		
		shouldShowError: true,
		className:'edit-model-property',
		schemaClass: PropertySchema,
		debounceChildControlEvents: 0,


		getDefaultValidateRule(options){
			let schema = this.getSchema();
			let rule = _.extend({}, schema.getType(options), schema.getValidation(options));
			return rule;
		},
		getValidateRule(options = {}){
			let rule = this.getDefaultValidateRule(options);
			return rule;
		},
		
		getHeaderView(){
			let view = buildViewByKey.call(this, 'header', { TextView });
			if(view) { return view; }

			if(this.getOption('propertyLabelAsHeader')) {
				let label = this.getSchema().getLabel();
				return new TextView({ text: label, tagName: 'header'});
			}
		},
		getControlView(){
			let options = {
				value: this.getControlValue(),
				allValues: this.getParentControlValue(),				
			};
			let editOptions = this.getSchema().getEdit(options);
			return this.buildPropertyView(editOptions);
		},
		controlValidate(value, allValues){
			let rule = this.getValidateRule({ value, allValues });
			if(!rule || !_.size(rule)) return;
			return validator.validate(value, rule, { allValues });
		},
		
		// must be overrided
		// accepts:	options arguments.
		// returns:	should return Control instance
		buildPropertyView(){
			throw new Error('buildPropertyView not implemented. You should build view by your own');
		},

	});
};

var ModelSchema = Schema.extend({
	constructor(properties = {}){
		this.properties = {};
		Schema.apply(this,arguments);
		this.setProperties(properties);
	},
	propertySchema: PropertySchema,
	_createProperty(property){
		let props = this.getProperties();
		let order = _.size(props);
		let Schema$$1 = this.getOption('propertySchema');
		let options = { name: property.name, property, modelSchema: this, order };
		return this.createProperty(Schema$$1, options);
	},
	createProperty(Schema$$1, options){
		return new Schema$$1(options);
	},
	setProperties(properties){
		return _.map(properties, (property, name) => {
			if(!_.isObject(property)) { return; }

			let propertyName = _.isString(name) ? name : property.name;
			if (isEmptyValue(propertyName)) {
				throw new Error('property name missing: ' + name);
			}			
			return this.setProperty(propertyName, property);

		});
	},
	getProperties(){
		return this.properties;
	},
	getPropertiesArray(){
		let props = this.getProperties();
		return _.toArray(props)
			.sort((p1,p2) => p1.order - p2.order);		
	},
	getPropertiesNames(){
		let props = this.getPropertiesArray();
		return _.pluck(props, 'name');
	},
	getProperty(name, { create = false } = {}){
		let properties = this.getProperties() || {};
		let property = properties[name];
		if(property || !create) {
			return property;
		}
		property = this._createProperty(name);
		return this.setProperty(name, property);
	},
	_setProperty(name, property){
		if(!_.isObject(property)){
			throw new Error('property is not an object', property);
		}
		if(isEmptyValue(name)){
			throw new Error('property has no name', property);
		}

		if (isEmptyValue(property.name)) {
			property.name = name;
		}

		if(!(property instanceof PropertySchema)){
			property = this._createProperty(property);
		}

		let properties = this.getProperties();
		properties[property.name] = property;

		return property;
	},
	setProperty(name, property) {
		if(_.isObject(name)){
			property = name;
			name = property.name;
		}
		return this._setProperty(name, property);
	},
	getValidation(name) {
		let property = this.getProperty(name);
		return property && property.getValidation() || {};
	},
	getType(name) {
		let property = this.getProperty(name);
		return property && property.getType() || {};
	},
	getLabel(name){
		let property = this.getProperty(name);
		return property && property.getLabel() || '';
	}
});

var model = Base => {
	const Mixed = mix(Base).with(ControlView, common$1);

	return Mixed.extend({
		
		validateOnReady: true,
		buttonsInFooter: true,
		isControlWrapper: false,
		schemaClass: ModelSchema,
		editPropertyClass: EditProperty,

		propertyLabelAsHeader: true,

		className:'edit-model-control',

		getCustoms(){
			let customs = [];
			customs.push(...this.getPropertiesViews());
			customs.push(...this._customs);
			customs = this.injectSystemViews(customs);
			return this._prepareCustoms(customs);
		},
		getPropertiesViews(){
			let modelSchema = this.getSchema();
			let propertiesToShow = this.getOption('propertiesToShow', { args: [ this.model, this ]}) || [];
			if(!propertiesToShow.length) {
				propertiesToShow = modelSchema.getPropertiesNames();
			}
			return _.map(propertiesToShow, name => this._createEditProperty(name, modelSchema));
		},
		_createEditProperty(name, modelSchema){
			let schema = modelSchema.getProperty(name, { create: true });
			let EditProperty$$1 = this.getEditPropertyClass();
			const def = {
				controlName: name,
				schema,
				value: this.getPropertyValue(name),
				allValues: this.getControlValue({ notValidated: true }),
				propertyLabelAsHeader: this.getOption('propertyLabelAsHeader')
			};
			let options = this.getEditPropertyOptions(def);
			return this.createEditProperty(EditProperty$$1, options);
		},
		getPropertyValue(property){
			return this.getControlValue(property);
		},
		getEditPropertyClass(){
			return this.getOption('editPropertyClass');
		},
		getEditPropertyOptions(defaultOptions){
			return _.extend({}, defaultOptions, this.getOption('editPropertyOptions'));
		},
		createEditProperty(EditProperty$$1, options){
			return new EditProperty$$1(options);
		},

	});
};



var index$14 = Object.freeze({
	Property: EditProperty,
	Model: model
});



var index$15 = Object.freeze({
	button: index$11,
	control: ControlMixin,
	controlView: ControlView,
	input: index$12,
	promiseBar: index$13,
	editSchema: index$14
});

var index$16 = CollectionView => CollectionView.extend({
	shouldHandleEmptyFetch: true, 
	constructor(){
		CollectionView.apply(this, arguments);

		this.getOption('shouldHandleEmptyFetch') && this.emptyView
			&& this._handleEmptyFetch();
	},
	_handleEmptyFetch(){
		if (!this.collection || this.collection.length) { return; }

		this.listenToOnce(this.collection, 'sync', 
			() => !this.collection.length && this._renderChildren()
		);

	},
});

function rebuildIndexes() {
	if (!this.getOption('shouldRebuildIndexes') || !this.collection) {
		return;
	}
	let models = this.collection.models;
	for (let index = 0, length = models.length; index < length; index++) {
		let model = models[index];
		let view = this._children.findByModel(model);
		view && (view._index = index);
	}
}

var index$17 = CollectionView => CollectionView.extend({
	shouldRebuildIndexes: true,

	constructor() {		
		
		CollectionView.apply(this, arguments);
		this.on('before:sort', rebuildIndexes.bind(this));
		// if (this.collection) {
		// 	rebuildIndexes.call(this);
		// 	this.listenTo({
		// 		'update': rebuildIndexes.bind(this),
		// 		'sort': rebuildIndexes.bind(this),
		// 		'reset': rebuildIndexes.bind(this),
		// 	});
		// }
	},
	_addChild(view, index){
		view._isModelView = arguments.length === 1;
		if (index != null) {
			view._index = index;
		}
		return CollectionView.prototype._addChild.apply(this, arguments);
	},
	_viewComparator(v1,v2){
		let res = v1._index - v2._index;
		if (res) return res;
		if (v1._isModelView) return 1;
		return -1;
	},
});

var nextCollectionView = CollectionView => CollectionView.extend({
	_renderChildren() {
		// If there are unrendered views prevent add to end perf
		if (this._hasUnrenderedViews) {
			delete this._addedViews;
			delete this._hasUnrenderedViews;
		}

		const views = this._addedViews || this.children._views;

		this.triggerMethod('before:render:children', this, views);
	
		this._showEmptyView();
	
		const els = this._getBuffer(views);
	
		this._attachChildren(els, views);
	
		delete this._addedViews;
	
		this.triggerMethod('render:children', this, views);
	},
	addChildView(view, index, options = {}) {
		if (!view || view._isDestroyed) {
			return view;
		}

		if (_.isObject(index)) {
			options = index;
		}

		// If options has defined index we should use it
		if (options.index != null) {
			index = options.index;
		}

		if (!this._isRendered && !options.preventRender) {
			this.render();
		}

		this._addChild(view, index);

		if (options.preventRender) {
			this._hasUnrenderedViews = true;
			return view;
		}

		const hasIndex = (typeof index !== 'undefined');
		const isAddedToEnd = !hasIndex || index >= this._children.length;

		// Only cache views if added to the end and there is no unrendered views
		if (isAddedToEnd && !this._hasUnrenderedViews) {
			this._addedViews = [view];
		}
		
		if (hasIndex) {
			this._renderChildren();
		} else {
			this.sort();
		}
	
		return view;
	},
	_showEmptyView() {

		this._destroyEmptyView();
	
		if(!this.isEmpty()) { return; }

		const EmptyView = this._getEmptyView();	
		if (!EmptyView) {
			return;
		}
	
		const options = this._getEmptyViewOptions();
		this._emptyViewInstance = new EmptyView(options);
	
		this.addChildView(this._emptyViewInstance, { preventRender: true, index: 0, });
	
	},
	_destroyEmptyView(){
		let view = this._emptyViewInstance;
		if (!view) return;
	
		this._removeChildView(view);
	
		this._removeChild(view);
	
		view.destroy();
		delete this._emptyViewInstance;
	},
}, { CollectionViewMixin_4x: true});



var index$18 = Object.freeze({
	emptyFetch: index$16,
	improvedIndexes: index$17,
	nextCollectionView: nextCollectionView,
	customs: customs$1
});



var index$19 = Object.freeze({
	common: index,
	model: index$2,
	collection: index$4,
	view: index$10,
	collectionView: index$18,
	controls: index$15
});

const Action = function(options = {}){
	let { name, action } = options;
	this.options = _.omit(options, 'name', 'callback');
	this.name = name;
	this._action = action;
};
Action.extend = extend;
_.extend(Action.prototype, {
	getOption(key){
		return getByPath(this.options, key);
	},
	getLabel(){ return this.name; },
	getAction() {
		return this._action;
	},
	exec(instance, ...args){
		let decline = this.isNotAllowed(instance, args);
		if (decline) {
			return this.onExecuteNotAllowed(instance, decline, args);
		}
		let action = this.getAction();

		if (_.isFunction(action)) {
			return action.apply(instance, args);
		}
		else {
			return this.onActionMissing(instance);
		}
	},
	is (arg) { return this == arg || this.name == arg; },
	isVisible () { return this.hidden !== true; },
	isNotAllowed () { },
	onExecuteNotAllowed () { },
	onActionMissing () { },
});

const store = {
	Action: Action,
	names:{},
	getStoreName(arg){
		if(_.isString(arg) && arg !== '') {
			return arg;
		}

		if (_.isFunction(arg)) {
			let store = this.getStoreByCtor(arg);
			if (store) {
				return store.name;
			}
		}
		return _.uniqueId('actionStore');		
	},
	getStoreByCtor(ctor){
		return _.find(this.names, f => f.ctor === ctor);		
	},
	isNotInitialized(arg){
		return !this.getStore(arg);
	},
	initialize({ name, actions, Action: Action$$1, buildAction } = {}) {
		let ActionClass = Action$$1 || this.Action;
		let ctor = _.isFunction(name) && name || undefined;
		name = this.getStoreName(name);

		if(name in this.names) { return; }

		let options = { name, ctor, Action: ActionClass };
		let actionsByNames = {};
		let builded = _.reduce(actions, (passed, action) => {

			action = this.buildAction(action, options);
			if(_.isFunction(buildAction)){
				action = buildAction(action, options);
			}
			if(!(action instanceof ActionClass)){
				action = new ActionClass(action);
			}
			if (!(action.name in actionsByNames)) {
				passed.push(action);
				actionsByNames[action.name] = action;
			}
			return passed;
		}, []);

		this.names[name] = {
			name, ctor, actions: builded, actionsByNames
		};
	},
	getStore(arg){
		if (_.isString(arg)) {
			return this.names[name];
		} else if (_.isFunction(arg)) {
			return this.getStoreByCtor(arg);
		}
	},
	getActions(arg, options){
		let cache = this.getStore(arg);
		if(!cache) return [];
		return _.filter(cache.actions, (action, index) => this.filter(action, index, options));
	},
	getAction(store, action){
		let cache = this.getStore(store);
		if (!cache) return;
		let name = _.isString(action) ? action : action.name;
		return cache.actionsByNames[name];
	},
	exec(store, action, instance, ...args) {
		let found = this.getAction(store, action);
		if (!found) {
			throw new Error('action not found:' + action);
		} else {
			return found.exec(instance, ...args);
		}
	},
	filter: () => true,
	buildAction: raw => raw,
};

function getFromPrototypes(instance, property, { exclude, process } = {}) {
	if(exclude && !_.isArray(exclude)) {
		exclude = [exclude];
	}
	if(!_.isFunction(process)) {
		process = value => value;
	}
	let prototype = instance.__proto__;
	let result = [];
	while(prototype){
		let value = prototype[property];
		prototype = prototype.__proto__;

		if (value == null) { continue; }

		if(exclude && exclude.indexOf(value) > -1) { continue; }
		
		value = process(value);
		if(value != null) {
			result.push(value);
		}
	}
	return result;
}



var actionable = Base => Base.extend({
	_actionableMixin: true,

	
	inheritActions: false,
	InstanceAction: Action,

	constructor(){
		Base.apply(this, arguments);
	},
	_initializeActionableActions(){
		if (this._actionableActionsInitialized) return;
		if (store.isNotInitialized(this.actionsStoreName || this.constructor)) {
			let instance = betterResult(this, 'actions', { args: [this], default: [] });
			let inherited = [];
			if (this.inheritActions) {
				let protoActions = getFromPrototypes(this, 'actions', {
					exclude: this.actions,
					process: actions => betterResult({ actions }, 'actions', { args: [this], default: [] })
				});
				inherited.push(..._.flatten(protoActions));
				inherited = _.filter(inherited, f => f != null);
			}
			let rawactions = [...inherited, ...instance];
			store.initialize({
				name: this.actionsStoreName || this.constructor, 
				actions: rawactions, 
				Action: this.ActionClass,
				buildAction: raw => this.buildStoreAction(raw),				
			});
		}
		this._actionableActionsInitialized = true;

	},

	buildStoreAction: action => action,
	getActions(options = {}){
		this._initializeActionableActions();
		return store.getActions(this.actionsStoreName || this.constructor, options);
	},
	executeAction(action){
		this._initializeActionableActions();
		return store.exec(this.actionsStoreName || this.constructor, action, this,  ...arguments);
	},
}, { ActionableMixin: true });



var index$20 = Object.freeze({
	Action: Action,
	ActionStore: store,
	ActionableMixin: actionable
});

const errorProps = ['description', 'fileName', 'lineNumber', 'name', 'message', 'number', 'url'];
function normalizeAppErrorOptions(data = {}){
	if(_.isString(data)){
		data = { message: data };
	}
	return data;
}
const AppError = extend.call(Error, {
	urlRoot: '',
	url: '',
	name: 'app:error',
	constructor(options){
		if (!(this instanceof AppError)) {
			return new AppError(_.extend({},options,{ newKeywordOmited: true }));
		}
		options = normalizeAppErrorOptions(options);
		let url = options.url;
		delete options.url;

		const error = Error.call(this, options.message);
		const important = {
			name: options.name || this.name,
			message: options.message || this.message,
		};
		if(url || this.url){
			important.url = (this.urlRoot || '') + (url || this.url || '');
		}
		options.name = important.name;
		_.extend(this, important, _.pick(error, errorProps), options);
	
		if (Error.captureStackTrace) {
			this.captureStackTrace();
		}
		if (options.url) 
			this.url = this.urlRoot + this.url;
	},	
	captureStackTrace(){
		Error.captureStackTrace(this, this.constructor);
	},
	toString() {
		let url = this.url ? ` See: ${ this.url }` : '';
		return `${ this.name }: ${ this.message }${url}`;
	}
});
// AppError.setUrlRoot = function(url){
// 	this.prototype.urlRoot = url;
// };
AppError.extend = extend;

//import Backbone from 'backbone';

// import Model from '../../b b/model';

let nativeAjax = Backbone.ajax;

const tokenizedAjax = function(...args){
	let options;

	if(args && args.length == 1 && _.isObject(args[0])){
		options = args[0];
	}
	if(args && args.length == 2 && !_.isObject(args[0]) && _.isObject(args[1])){
		options = args[1];
	}

	options && (options.headers = _.extend({}, options.headers, this.getAjaxHeaders()));

	return nativeAjax.apply($, args);
};


const Token = Backbone.Model.extend({

	tokenAttribute: 'access_token',
	refreshTokenAttribute: 'refresh_token',
	endPoint: 'auth/token',
	secondsOffset: 0,

	shouldRequestOnInitialize: true,

	constructor(){
		this.ajaxHeaders = {};
		this.flows = {};
		this.initializeFlows();
		this.setExpiration(null);

		Backbone.Model.apply(this, arguments);

		if (this.shouldRequestOnInitialize) {
			this.getReady();
		}
	},

	getReady(){
		if(this.ready) return this.ready;
		
		if (!this.hasToken()) {
			this.ready = Promise.resolve();
		} else {
			this.ready = this.refresh({force: true}).catch(() => {
				this.update(null);
			});
		}

		return this.ready;
	},
	

	initializeFlows(){

		this.setFlow('password', {
			url: this.endPoint,
			method: 'POST'
		});
		this.setFlow('refresh', {
			url: this.endPoint,
			method: 'POST'
		});

	},
	getFlow(key){
		return _.clone(this.flows[key] || {});
	},
	setFlow(key, value){
		this.flows[key] = value;
	},



	hasToken(){
		return this.getToken() != null;
	},
	getToken(){
		return this.get(this.tokenAttribute);
	},

	getRefreshToken(){
		return this.get(this.refreshTokenAttribute);
	},

	getAjaxHeaders(){		
		return this.ajaxHeaders;
	},	

	parse(data){
		return data;
	},

	fetch(options = {}){
		if(this._fetching) return this._fetching;		
		this._fetching = nativeAjax(options).then(
			(json) => {

				let parsed = this.parse(_.clone(json));
				this.update(parsed);
				delete this._fetching;
				return Promise.resolve(json);
			}, 
			(xhr) => {
				
				delete this._fetching;
				
				options.clearOnFail !== false 
					&& this.update(null);

				let error = this.handleError(xhr);
				if(error){

					return Promise.reject(error);
				} else {
					return Promise.reject(xhr);
				}
			});	
		return this._fetching;
	},
	handleError(){},
	update(hash, opts = {}){
		let { silent } = opts;
		if (hash == null) {

			this.clear(opts);

		} else {
			let fullhash = _.extend({}, this.attributes, hash);
			let unset = [];
			let shouldUnset = !!opts.unset;
			let setHash = _(fullhash).reduce((memo, value, key) => {
				if (key in hash) {
					memo[key] = value;
				} else if (shouldUnset) {
					unset.push(key);
				} else {
					memo[key] = undefined;
				}
				return memo;
			}, {});

			setHash = this.parse(setHash);
			this.set(setHash, { silent });
			_(unset).each(key => this.unset(key, { silent }));
		}

		this.reflectTokenChanges();

	},

	replaceBackboneAjax(){		
		if(!this.hasToken())
			Backbone__default.ajax = nativeAjax;
		else
			Backbone__default.ajax = (...args) => this.ajax(...args);
	},
	updateAjaxHeaders(token){
		token || (token = this.getToken());
		let headers = this.getAjaxHeaders();
		if (token) {
			headers.Authorization = 'Bearer ' + token;
			headers.Accept = 'application/json';
		} else {
			delete headers.Authorization;
		}
	},

	//implement by your own
	storeToken(){},

	reflectTokenChanges(opts = {}){
		let { silent, store = true } = opts;
		this.updateAjaxHeaders();
		this.replaceBackboneAjax();
		if (store)
			this.storeToken();
		if (!silent)
			this.trigger('changed');
	},

	ajax(...args){
		return this.refresh().then(
			() => tokenizedAjax.apply(this, args),
			error => Promise.reject(error)
		);
	},	
	refresh(opts = {}){		

		// if token is fresh enough and there is no force refresh
		// pass
		if (!this.isExpired() && !opts.force) {
			return Promise.resolve();
		}
		let options = this.getFlow('refresh');
		options.data = this.getRefreshTokenData();
		return this.fetch(options);
	},
	getRefreshTokenData(){
		return {
			'grant_type':'refresh_token',
			'refresh_token': this.getRefreshToken(),
		};
	},

	setExpiration(arg){

		if (arg === null) {
			this.expiresAt = null;
		}

		let date;
		let now = new Date();

		if (_.isDate(arg)) {
			date = arg;
		} else if(_.isObject(arg)) {
			date = new Date();
			
			let { seconds, minutes, hours, days } = arg;
			date.setDate(date.getDate() + (days || 0));
			date.setHours(date.getHours() + (hours || 0));
			date.setMinutes(date.getMinutes() + (minutes || 0));
			date.setSeconds(date.getSeconds() + (seconds || 0));
		}

		if(!_.isDate(date) || isNaN(date.valueOf()) || date < now) {
			date = new Date();
			date.setSeconds(now.getSeconds() + 90);
		}

		this.expiresAt = date;
	},
	getExpiration(){
		return this.expiresAt;
	},
	isExpired(){
		let date = this.getExpiration();
		if(!_.isDate(date) || isNaN(date.valueOf()))
			return true;
		return date.valueOf() < Date.now() + (this.secondsOffset * 1000);
	},
	login(username, password){

		let options = this.getFlow('password');
		options.data = { grant_type:'password', username, password };
		options.clearOnFail = false;
		return this.fetch(options);

	},

});

Token.setNativeAjax = function(arg){
	let old = nativeAjax;
	nativeAjax = arg;
	return old;
};

const config = {
	destroySelfOnEmpty: false,
	destroyOnEmpty: false,
};

const BaseNodeRegion = Mn.Region.extend({
	onEmpty() {
		let destroySelf = this.getOption('destroySelfOnEmpty') || this.getOption('destroyOnEmpty');
		let destroyNode = this.getOption('destroyOnEmpty');
		destroySelf && this.destroy();
		destroyNode && this.el.remove();
	}
});

config.Region = BaseNodeRegion;

function normalizeElement(selector) {
	let body = document.querySelector('body');
	let el;
	if (selector == null) {
		el = body;
	} else if( selector instanceof Element) {
		el = selector;
	}
	else if(selector && selector.jquery){
		el = selector.get(0);
	} else if (_.isString(selector)) {
		el = document.querySelector(selector);
	}
	if (el instanceof Element) {
		return el;
	} else {
		throw new Error('el must be in Dom');		
	}
}

function renderInNode(view, { el, replaceElement = false, destroySelfOnEmpty = config.destroySelfOnEmpty, destroyOnEmpty = config.destroyOnEmpty  } = {}) {
	const NodeRegion = config.Region;
	el = normalizeElement(el);
	const body = document.querySelector('body');
	if (el === body) {
		el = document.createElement('div');
		body.appendChild(el);
		replaceElement = true;
	}
	const region = new NodeRegion({ el, replaceElement, destroySelfOnEmpty, destroyOnEmpty });
	region.show(view);
	return region;
}

const ViewStack = function(options = {}){
	this.cid = _.uniqueId('stack');
	this.unremovableKey = `_${this.cid}_preventRemove`;
	this.destroyOnRemove = true;
	this.removeOnEsc = true, this.removeOnOutsideClick = true, this.options = options;
	this.stack = [];
};
_.extend(ViewStack.prototype, Backbone.Events, {


	add(view, options){
		if(!_.isObject(view)) { return; }
		if (this.getOption('clearBeforeAdd')) {
			this.removeAll();
		}
		this.triggerMethod('before:add');

		this.stack.push(view);
		this._setupView(view, options);

		this._stackChanged(1, view);

	},
	_setupView(view, { preventRemove } = {}){
		if (preventRemove) {
			let key = this.getUnremovableKey();
			view[key] = true;
		}
		this.listenToOnce(view, 'destroy', () => this._removeView(view, { selfDestroy: true }));		
	},
	remove(view, { destroy } = {}){
		let destroyOnRemove = this.getOption('destroyOnRemove');
		let removed = this._removeView(view);
		if (removed && (destroy || destroyOnRemove)) {
			this._destroyView(view);
		}
	},
	getLast(){
		return _.last(this.stack);
	},
	removeLast(){
		let view = this.getLast();
		this.remove(view);
	},
	destroyLast(){
		let view = this.getLast();
		this.remove(view, { destroy: true });
	},


	_removeView(view, { selfDestroy } = {}){
		if (!_.isObject(view)) { return; }

		if (this.isViewUnremovable(view, selfDestroy)) {
			return;
		}

		this._cleanUpView(view);

		let index = this.stack.indexOf(view);
		if (index === -1) return;

		if (index == this.stack.length - 1)
			this.stack.pop();
		else
			this.stack.splice(index, 1);
			
		this._stackChanged(-1);

		return view;
	},
	_cleanUpView(view){
		this.stopListening(view);
		delete view[this.getUnremovableKey()];
	},
	_destroyView(view) {
		if (_.isObject(view) && _.isFunction(view.destroy)) { 
			view.destroy();
		}
	},	
	_stackChanged(change, view){
		if (change > 0) {
			this._setDocumentListeners();			
			this.triggerMethod('add', view);
		} else {
			this._unsetDocumentListeners();			
			this.triggerMethod('remove', view);
		}

	},


	/*
		Unremovable view methods
		sometimes you want to prevent view to be removed from the stack		
	*/
	getUnremovableKey(){
		return this.getOption('unremovableKey');
	},
	// options is for internal use only.
	// self destroy flag filled when a view destroyed outside the stack
	isViewUnremovable(view, { selfDestroy }={}){
		if (selfDestroy) return false;
		let key = this.getUnremovableKey();
		return view[key];
	},	


	/*
		DOM listeners logic
		- esc handler
		- outside click handler
	*/
	getViewDomElement(view){
		return view && view.el;
	},
	isElementOutsideOfView(eventElement, view){
		let viewElement = this.getViewDomElement(view);
		if (!viewElement) return;
		return !$.contains(viewElement, eventElement);
	},
	getViewIfElementOutside(eventElement){
		let view = this.getLast();
		if (!view) return;
		if(this.isElementOutsideOfView(eventElement, view)) {
			return view;
		}
	},
	outsideClickHandler(event){
		if (!this.stack.length) { return; }

		let view = this.getViewIfElementOutside(event.target);
		if (!view) { return; }

		event.preventDefault();
		event.stopPropagation();
		this.remove(view);

	},
	escapePressHandler(event){
		if (!this.stack.length || event.keyCode !== 27 ) return;

		event.preventDefault();
		event.stopPropagation();
		this.removeLast();

	},

	_setDocumentListeners(){
		if (this._documentListeners || !this.stack.length) return;
		let $doc = this.getDocument();
		if (this._shouldRemoveOnEsc()) {			
			this._escapePressHandler = _.bind(this.escapePressHandler, this);
			$doc.on('keyup', this._escapePressHandler);
			this.triggerMethod('dom:listeners:escape:on');
		}
		if (this._shouldRemoveOnOutsideClick()) {
			this._outsideClickHandler = _.bind(this.outsideClickHandler, this);
			$doc.on('click', this._outsideClickHandler);
			this.triggerMethod('dom:listeners:click:on');
		}
		this.triggerMethod('dom:listeners:on');
		this._documentListeners = true;
	},
	_unsetDocumentListeners(){
		if (!(this._documentListeners && !this.stack.length)) return;
		let $doc = this.getDocument();
		if (this._escapePressHandler) {
			$doc.off('keyup', this._escapePressHandler);
			delete this._escapePressHandler;
			this.triggerMethod('dom:listeners:escape:off');
		}
		if(this._outsideClickHandler) {
			$doc.off('click', this._outsideClickHandler);
			delete this._outsideClickHandler;
			this.triggerMethod('dom:listeners:click:off');
		}
		this.triggerMethod('dom:listeners:off');
		this._documentListeners = false;
	},
	_shouldRemoveOnEsc(){
		return this.getOption('removeOnEsc') === true;
	},
	_shouldRemoveOnOutsideClick(){
		return this.getOption('removeOnOutsideClick') === true;
	},


	/*
		helper methods
	*/
	getOption: instanceGetOption,
	triggerMethod,

	getDocument(){
		return this.$doc || $(document);
	},
	isDestroyed(){
		return this._isDestroyed || this._isDestroying;
	},
	removeAll(){
		while(this.stack.length){
			this.destroyLast();
		}
	},
	destroy(){
		if(this._isDestroyed || this._isDestroying) { return; }		
		this._isDestroying = true;

		this.triggerMethod('before:destroy');

		this.removeAll();

		let $doc = this.getDocument();
		$doc.off('keyup', this._onKeyUp);
		$doc.off('click', this._outsideClick);

		this._isDestroyed = true;
		this.triggerMethod('destroy');
	},
});

var ViewMixin = CollectionView => {
	let Mixed = CollectionView;
	let mixWith = [];

	if (!Mixed.DestroyMixin) {
		mixWith.push(destroy);
	}
	if (!Mixed.CollectionViewMixin_4x) {
		mixWith.push(nextCollectionView);
	}

	if (!Mixed.CustomsMixin) {
		mixWith.push(customs$1);
	}

	if (mixWith.length) {
		Mixed = mix(Mixed).with(...mixWith);
	}

	return Mixed.extend({
		viewComparator:false,
		wrapContent: true,
		childViewContainer: '[data-modal-content]',
		renderAllCustoms: true,
		templateContext(){
			return {
				shouldWrapContent: this.getOption('wrapContent') === true,
			};
		},
		events:{
			'click'(event){
				if(this.getOption('preventRemove')) {
					return;
				}
				let $el = $(event.target);
				event.stopPropagation();
				if ($el.closest('[data-modal-content]').length) {
					return;
				}
				this.destroy();
			}
		},
		customs:[
			(v) => v.createCloseButton(),
			(v) => v.takeOptionsView('header'),
			(v) => v.takeOptionsView('content'),
			(v) => v.takeOptionsView('footer'),
		],
		createCloseButton(){
			if (!this.getOption('closeButton') || this.getOption('preventRemove')) {
				return;
			}
			let Button = this.getOption('closeButtonView');
			if (!isViewClass(Button)) {
				throw new Error('CloseButtonView not defined in modals config');
			}
			let view = new Button({ attributes: { 'data-modal-close':'' } });
			this.listenTo(view, 'click', this.destroy);
			return view;
		},
		takeOptionsView(key){
			let view = this.getOption(key);
			let _view;
			if(!view) {			
				return view;
			} else if(isView(view)) {
				_view = view;
			}
			else if(_.isString(view)){			
				let tagName = ['header','footer'].indexOf(key) > -1 ? key : 'div';
				let View$$1 = this.getOption('textView') || TextView;
				_view = new View$$1({ text: view, tagName });
			} else if(isViewClass(view)) {
				let options = this.getOption(key+'Options');
				_view = new view(options);
			}
			if(_view){
				!this.modalChildren && (this.modalChildren = {});
				this.modalChildren[key] = _view;
				if (key === 'content') {
					this._initContentListeners(_view);
				}
				return _view;
			}
		},
		_initContentListeners(content){
			this.listenTo(content, {
				'destroy': () => this.destroy(),
				'done': () => this.destroy(),
			});
		},
		attributes:{
			'data-modal': ''
		},
	});
};

var config$1 = {
	
	template: _.template(`
<div data-modal-bg></div>
<% if(shouldWrapContent) {%><div data-modal-content-wrapper><%} %>
<section data-modal-content></section>
<% if(shouldWrapContent) {%></div><%} %>
`),

	BaseView: undefined,
	TextView: undefined,
	ModalView: undefined,
	CloseButtonView: undefined,

	buildView(options, View$$1){
		if(!isViewClass(View$$1)) {
			if (!this.ModalView) {
				if (!this.BaseView) {
					throw new Error('modals config has no View defined. please set View or BaseView');
				}
				this.ModalView = ViewMixin(this.BaseView);
			}
			View$$1 = this.ModalView;
		}
		options = _.extend({ 
			textView: this.TextView || Mn.View, 
			closeButtonView: this.CloseButtonView || Mn.View,
			template: this.template,
		}, options);
		return new View$$1(options);
	},
	render(view, stack, options = {}){
		let el = _.result(this, 'container');
		if(el && el.jquery){
			el = el.get(0);
		}
		options = _.extend({ 
			el, replaceElement: true, destroyOnEmpty: true,			
		}, options);

		renderInNode(view, options);

		if (stack) {
			let { preventRemove } = options;
			stack.add(view, { preventRemove });
		}
	},
	container: () => document.querySelector('body'),
	stackOptions: {
		removeOnEsc: true,
		removeOnOutsideClick: true,
	},
	getStack(options){
		if (!this.stack) {
			let stackOptions = this.stackOptions || options;
			this.stack = new ViewStack(stackOptions);
		}
		return this.stack;
	}
};

function show(opts = {}, showOptions = {}){

	let { preventRemove, promise } = opts;

	let modal = config$1.buildView(opts);
	showOptions.preventRemove = preventRemove;
	config$1.render(modal, config$1.getStack(), showOptions);

	if (promise) {
		return modal.promise;
	} else {
		return modal;
	}

}


var index$21 = {
	config: config$1,
	show
};

const store$1 = {
	schemas: {},
	getStoreName(arg){
		if(_.isString(arg) && arg !== '') {
			return arg;
		}

		if (_.isFunction(arg)) {
			let store = this.getStoreByCtor(arg);
			if (store) {
				return store.name;
			}
		}
		return _.uniqueId('modelSchema');		
	},
	getStoreByCtor(ctor){
		return _.find(this.schemas, f => f.ctor === ctor);		
	},
	isNotInitialized(arg){
		return !this.getStore(arg);
	},
	initialize(name, schema = {}) {
		if (!this.isNotInitialized(name)) {
			throw new Error('Schema already initialized');
		}
		let ctor = _.isFunction(name) && name || undefined;
		name = this.getStoreName(name);

		if(name in this.schemas) { return; }

		if(!(schema instanceof ModelSchema) && _.isObject(schema)){
			schema = new ModelSchema(schema);
		} else {
			schema = new ModelSchema({});
		}
		this.schemas[name] = {
			name, ctor, schema
		};
		return schema;
	},
	getStore(arg){
		if (_.isString(arg)) {
			return this.schemas[arg];
		} else if (_.isFunction(arg)) {
			return this.getStoreByCtor(arg);
		}
	},
	get(arg) {
		let cache = this.getStore(arg);
		return cache && cache.schema || undefined;
	}
};

function get$1(router, opts = {}, key, update){
	
	let value = betterResult(opts, key, { context: router, args:[ router ] });
	if(value == null) {
		value = router.getOption(key, {args: [ router ]});
		if(update)
			opts[key] = value;
	}
	return value;		
}

// converts route method arguments to plain object;
// _normalizeRegisterRouteArguments
// { route, rawRoute, callback, name }
function routeArgumentsToObject(router, route, name, callback, opts = {}){

	let context = {};

	if(_.isObject(route)){
		context = route;
		//_.extend(context, route);
		//then second argument is probably options;
		_.extend(opts, name);

	} else if (_.isFunction(name)) {
		_.extend(context, { route, callback: name, name: _.uniqueId('routerAction') });
	} else {
		_.extend(context, { route, name, callback });
	}

	let isRouterHoldsActions = get$1(router, opts, 'isRouterHoldsActions', true);
	//let isRouteChaining = get(router, opts, 'isRouteChaining', true);

	// !_(opts).has('isRouterHoldsActions') && (opts.isRouterHoldsActions = this.getOption('isRouterHoldsActions'));
	// !_(opts).has('isRouteChaining') && (opts.isRouteChaining = this.getOption('isRouteChaining'));


	// last chance to get callback from router instance by name
	// this behavior can be disabled through `isRouterHoldsActions` options
	if(!_.isFunction(context.callback) && isRouterHoldsActions && _.isFunction(router[context.name])) {

		context.callback = router[context.name];

	}

	//store original route
	context.rawRoute = context.route;

	!context.name && (context.name = _.uniqueId('routerAction'));

	//converts route to RegExp pattern
	if (!_.isRegExp(context.route)) context.route = router._routeToRegExp(context.route);

	// by default backbone router wraps every callback with own wrapper
	// which in turn call actual callback with correct arguments on route
	// this callback was inlined and can not be overrided, so now its possible	
	context.callbackWrapper = _.bind(router._processCallback, router, context);

	return context;
}

function createActionContext(router, routeContext, fragment, options = {}) {

	let rawArgs = router._extractParameters(routeContext.route, fragment);

	let result = _.extend({}, routeContext, { fragment, rawArgs }, options, { options });

	let args = rawArgs.slice(0);
	let queryString = args.pop();

	_.extend(result, { qs: prepareActionQueryString(router, queryString) });
	_.extend(result, { args: prepareActionArguments(routeContext.rawRoute, args) });

	if (result.routeType == null) {
		result.routeType = 'route';
	}

	return result;
}

function prepareActionQueryString(router, queryString){
	if(_.isString(queryString))
		return router.queryStringParser(queryString);
	else
		return {};
}

function prepareActionArguments(rawRoute, args){

	let params = rawRoute.match(/:([^/|)]+)/g) || [];
	
	let res = {};
	_(params).each((name, index) => {
		name = name.substring(1);
		
		if(args == null) return;

		if(name in res && _.isArray(res[name]))
			res[name].push(args[index]);
		else if(name in res && !_.isArray(res[name]))
			res[name] = [res[name]].concat(args[index]);
		else
			res[name] = args[index];
	});
	return res;
}

function toPromise(arg, resolve = true){
	if (arg instanceof Promise || (arg && _.isFunction(arg.then)))
		return arg;
	else if (arg instanceof Error)
		return Promise.reject(arg);
	else
		return resolve 
			? Promise.resolve(arg) 
			: Promise.reject(arg);
}
function getCallbackFunction(callback, executeResult)
{
	return (...args) => {
		try {
			executeResult.value = callback && callback(...args);
		} catch(exception) {
			executeResult.value = exception;
		}
		executeResult.promise = toPromise(executeResult.value);
		return executeResult.value;
	};
}


function processCallback(router, actionContext, routeType){	
	
	let args = router.getOption('classicMode') 
		? actionContext.rawArgs || [] 
		: [ actionContext ];

	let asPromise = router.getOption('callbackAsPromises');
	let executeResult = {};
	let callback = getCallbackFunction(actionContext.callback, executeResult, asPromise);

	//console.log('routeType:',routeType);

	router.triggerEvent('before:' + routeType, actionContext);

	let shouldTriggerEvent = router.execute(callback, args);
	if (shouldTriggerEvent !== false) {
		router.triggerEvent(routeType, actionContext);
		if(routeType == 'route' || routeType == 'backroute')
			router.lastAttempt = actionContext;
	}

	executeResult.promise.then(
		(arg) => {
			router.triggerEvent('after:'+routeType, actionContext);
			return arg;
		},
		(error) => {
			router.triggerEvent('error:' + routeType, error, actionContext);
			router.handleError(error, actionContext);
		}
	);

	return executeResult.value;
}

var errorHandler = {
	handlers: {
		'js:error'(error){
			throw error;
		},
	},
	handle(error, context, args){

		let handlers = this._getHandleContext(error, context, args) || {};
		return _(handlers).some((options, key) => this.applyHandler(key, options));

	},
	applyHandler(key, options = {}){

		let handler = this.getHandler(key, options);
		if (!handler) return;
		let { context, args } = options;
		return handler.apply(context, args);

	},
	getHandler(key){
		if(_.isFunction(this.handlers[key]))
			return this.handlers[key];
	},
	setHandler(key, handler){
		if(!_.isString(key) || key === '')
			throw new Error('setHandler first argument must be a non empty string');

		if (!_.isFunction(handler)) {
			delete this.handlers[key];
		} else {
			this.handlers[key] = handler;
		}
	},
	setHandlers(hash){
		let nullable = hash === null;
		let items = nullable && this.handlers || hash;
		if(!_.isObject(items)) return;
		_(items).each((handler, key) => this.setHandler(key, nullable || handler));
	},

	// should return hash: { 'handler_key': { context: handler_context, args: handler_arguments}}
	_getHandleContext(error, context, args = []){

		if (_.isArray(error)) {
			return _(error).reduce((memo, item) => _.extend(memo, this._getHandleContext(item, context, args)), {});
		}

		if(_.isFunction(this.getHandleContext)) {
			let custom = this.getHandleContext(error, context, args);
			if(custom != null) return custom;
		}

		if (error instanceof Error) {
			args.unshift(error);
			return { 'js:error': { context, args } };
		}
		else if(_.isString(error)) {
			return { [error]: { context, args } };
		}
		else if(error instanceof $.Deferred().constructor){
			args.unshift(error);
			return { 'jq:xhr': { context, args }};
		}

	},

	// provide your own arguments processor
	// should return hash: { 'handler_key': { context: handler_context, args: handler_arguments}}
	getHandleContext: undefined,

};

const BaseRouter = mix(Backbone.Router).with(Mixin);
const Router$1 = BaseRouter.extend({


	// for migrating from Mn.AppRoute
	// set to true. it will populate routes from { controller, appRoutes } structure.
	isMarionetteStyle: false,

	// by default Backbone.Router tries to lookup callback in router instance by name `callback = this[name]` if there is no callback provided
	// its recomend to turn this feature to false
	// default value is true for Backbone.Router compatability
	isRouterHoldsActions : true,

	// by default Backbone.Router `route` method returns router itself instead of just created routeContext for chaining purposes.
	// you can change this behavior turning this feature to false
	isRouteChaining: true,

	//in classic mode actions receive argument array
	//if you need actionContext instead turn this option to false
	classicMode: true,

	constructor(options = {}){
		
		this.options = _.extend({}, _.result(this, 'options'), options);

		BaseRouter.apply(this, arguments);

		//this.on('re:route:last', this._onReRouteLast);
	},


	/*

		initialize methods
		"when a router initialized"

	*/

	//by default router expects that routes will result in { route, callback } hash
	//we are extending this to provide more flexibility
	// - overrided
	_bindRoutes: function() {
		
		let routes = this.getInitRoutes();
		if(!_.size(routes)) return;
		this.addRoutes(routes);

	},
	getInitRoutes(){
		let routes;
		if(this.getOption('isMarionetteStyle')) {
			let controller = this.getOption('controller') || {};
			let approutes = this.getOption('appRoutes') || {};
			routes = _(approutes).map((name, route) => ({ 
				route, name, 
				callback: controller[name] 
			}));
		}
		else {
			routes = this.getOption('routes');
		}
		return routes;
	},


	/*
		manipulating routes
		adding
	*/

	// refactored original route method
	// chain:true by default is for supporting default behavior
	// routerHoldsActions: true - backbone router tries to get callback from router itself if there is no callback provided. 
	// this options allow to support this behavior, but its recomended not to hold action inside router instance
	// - overrided
	route(route, name, callback, opts = {}){
		
		//normalizing passed arguments and putting them into a context object
		//refactored from original route
		// let context = this._normalizeRegisterRouteArguments(route, name, callback, opts);

		// //extends context with result of `mergeWithRegisterRouteContext`
		// this._normalizeRegisterRouteContext(context);

		// //wrapping provided callback 
		// this._normalizeRegisterRouteCallback(context);

		let context = this._buildRouteContext(route, name, callback, opts);

		//refactored for providing possibility to override
		//at this point context should be almost ready
		this.registerRouteContext(context);

		this._storeCreatedContext(context, opts);

		return opts.isRouteChaining === true 
			? this 
			: context;

	},

	// provide more semantic alias for route
	addRoute(route, name, callback, opts = {}){
		if(opts.isRouteChaining == null)
			opts.isRouteChaining = this.getOption('isRouteChaining');

		let context = this.route(route, name, callback, opts);
		return context;
	},

	//process many routes at once
	//accepts object { name, routeContext | handler }
	// or array of routeContexts
	addRoutes(routes, opts = {}){

		if(opts.isRouteChaining == null)
			opts.isRouteChaining = this.getOption('isRouteChaining');

		let normalized = _(routes)
			.chain()
			.map((value, key) => this._normalizeRoutes(value, key))
			.filter(f => _.isObject(f))
			.value();

		if(opts.doNotReverse != true)
			normalized.reverse();

		let registered = _(normalized).map(
			route => route && 
			this.addRoute(route, _.extend({ massAdd:true }, opts))
		); 
		
		if(opts.doNotReverse != true)
			registered.reverse();

		_(registered).each((c) => this._storeCreatedContext(c));
		
		return registered;
	},

	// internal method called by `addRoutes` to normalize provided data
	_normalizeRoutes(value, key){
		//let route, name, callback;
		let context;
		if (_.isString(value)) {
			context = { 
				route: key, 
				name: value, 
			};
		}
		else if(_.isFunction(value)){
			context = { route:key, callback:value };
		}else if(_.isObject(value)){
			context = _.clone(value);
			if(!_.has(context, 'route'))
				context.route = key;
			else if(_.has(context, 'route') && !_.has(context, 'name'))
				context.name = key;
		}
		else {
			return;
		}
		return context;
	},




	_buildRouteContext(route, name, callback, opts) {

		let context = routeArgumentsToObject(this, route, name, callback, opts);

		return this.buildRouteContext(context);
	},

	//override this method if you need more information in route context
	// should return object wich will be merged with default context
	// be aware of providing reserved properties: route, name, callback
	// this will override context defaults
	buildRouteContext: context => context,


	//finally, putting handler to the backbone.history.handlers
	registerRouteContext(context){
		Backbone__default.history.route(context.route, context.callbackWrapper, context);
	},

	//store registered context for further use
	_storeCreatedContext(context, opts = {}){
		this.routeContexts || (this.routeContexts = {});
		if(!opts.massAdd)
			this.routeContexts[context.name] = context;
		return context;
	},



	/*
	
		process route methods		
		"when route happens"

	*/

	//inner route handler
	//preparing actionContext and calls public processCallback
	_processCallback (routeContext, fragment, options = {}) {
		let actionContext = createActionContext(this, routeContext, fragment, options);
		actionContext.restart = () => actionContext.callbackWrapper(fragment, options);
		let result = this.processCallback(actionContext, actionContext.routeType, options);
		return result;
	},
	
	//by default behave as original router
	//override this method to process action by your own
	processCallback(actionContext, routeType){

		return processCallback(this, actionContext, routeType);

	},

	handleError(error, action){		
		errorHandler.handle(error, this, [action]);
	},

	//just triggers appropriate events
	// triggerRouteEvents(context, event, name, ...args) {
	// 	if (event == 'route') {
	// 		this.lastActionContext = context;
	// 	}
	// 	this.trigger(`${event}:${name}`, ...args);
	// 	this.trigger(event, name, ...args);
	// 	Backbone.history.trigger(event, this, name, ...args);
	// },

	triggerEvent(event, context){
		this.trigger(event, context);
		Backbone__default.history.trigger(event, context);
	},




	//converts string to object
	//default implementation, can be overriden by user
	queryStringParser: paramsToObject,	

	// navigate(...args){
	// 	historyNavigate(...args);
	// 	return this;
	// },

	_routeToRegExp(route) {

		var optionalParam = /\((.*?)\)/g;
		var namedParam    = /(\(\?)?:\w+/g;
		var splatParam    = /\*\w+/g;
		var escapeRegExp  = /[-{}[]+?.,\\\^$|#\s]/g;

		route = route.replace(escapeRegExp, '\\$&')
			.replace(optionalParam, '(?:$1)?')
			.replace(namedParam, function(match, optional) {
				return optional ? match : '([^/?]+)';
			})
			.replace(splatParam, '([^?]*?)');
		let flags = this.getOption('routeCaseInsensitive') ? 'i' : '';
		return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$', flags);
	},


	/*
		Some API methods
	*/

	getContextByFragment(fragment)	{
		if(!_.isString(fragment)) return;
		//let contexts = this.routeContexts;
		//console.log('Router contexts', contexts);
		let result = _(this.routeContexts).find((cntx) => cntx.route.test(fragment));
		return result;
	}


});

var BaseRouter$2 = Router$1.extend({
	
	classicMode:false,
	isRouterHoldsActions : false,
	isRouteChaining: false,	
	callbackAsPromises: true,
	routeCaseInsensitive: true,
	registerPageRoutes(page){
		let contexts = page.getRoutesContexts({ reverse: true });
		_(contexts).each(context => {
			let callback = (...args) => {
				return this.startPage(page, ...args);
			};
			this.addRoute(context.route, context.name, callback);
		});
	},
	handleError(process, action){
		let args, error;

		if(process instanceof Process) {
			args = [].slice.call(process.errors) ;
			error = args.shift();
			args.push(action);
		} else {
			error = process;
			args = [action];
		}

		errorHandler.handle(error, this, args);

		//BaseRouter.prototype.handleError(error, action);
	},
	startPage(page, ...args){
		return this.beforePageStart(page)
			.then(() => page.start(...args))
			.then(() => this.afterPageStart(page, ...args));
	},
	beforePageStart(){
		if (this.previousPage && this.previousPage.isStarted())
			return this.previousPage.stop();
		else
			return Promise.resolve();
	},
	afterPageStart(page){
		this.previousPage = page;
	},
	restartLastAttempt(){
		if(this.lastAttempt)
			return this.lastAttempt.restart();
	}
});

var RoutesMixin = {
	initializeRoutes(){
		if (this.initializeRouter()) {
			this._buildRoutesContexts();

		}
	},
	initializeRouter(){		
		if(this.getOption('shouldCreateRouter') && !this.router) {
			this.router = this._createRouter();
			this._shouldRegisterAllRoutes = true;
		}

		return !!this.router;
	},
	_createRouter(){
		let Router$$1 = this.getOption('Router') || BaseRouter$2;
		let options = _.extend({}, this.getOption('routerOptions'));
		return new Router$$1(options);
	},
	registerAllRoutes(){
		if(!this._shouldRegisterAllRoutes) return;

		let pages = this.getAllChildren({ reverse: true, includeSelf: true, force: true });
		
		let router = this.router;
		_(pages).each(page => router.registerPageRoutes(page));
		
	},
	_buildRoutesContexts(){
		let routes = this.getOption('routes', {args: [this]});
		if (routes == null) return;
		if(_.isString(routes))
			routes = [routes];

		let result = [];
		let config = this.getRoutesConfig();
		_(routes).each((route, index) => {
			let context = this._normalizeRoutesContextRoute(route, index, config);
			_.isObject(context) && (result.push(context));
		});
		this.routesContext = result;
		return this.routesContext;
	},
	_normalizeRoutesContextRoute(arg, index, config = {}){
		if(arguments.length < 2){
			config = this.getRoutesConfig();
		}
		let context = { page: this };
		if(arg == null)
			return;
		if (_.isString(arg)) {
			_.extend(context, {route: arg, rawRoute: arg });
		} else if(_.isFunction(arg)) {
			arg = arg.call(this, this, index);
			return this._normalizeRoutesContextRoute(arg, index);
		} else {
			_.extend(context, arg);
		}
		let name = (_.isString(index) && index) || context.name || context.route || _.uniqueId('route');
		context.name = name;

		if(_.isNumber(index) && context.order == null)
			context.order = index;

		if (!context.rawRoute)
			context.rawRoute = context.route;
				
		if(config.relative && config.parentContext && config.parentContext.route)
			context.route = config.parentContext.route + '/' + context.route;

		return context;
	},
	getRoutesConfig(){
		let config = _.extend({ 
			relative: this.getOption('relativeRoutes', {args: [this]}),
			parent: this.parent,
			parentContext: this.parent && _.isFunction(this.parent.getMainRouteContext) && this.parent.getMainRouteContext()
		}, this.getOption('routesConfig', {args: [this]}));
		
		return config;
	},
	getRoutesContexts(opts = {}){
		let { clone, reverse } = opts;
		let result = this.routesContext || [];
		if (clone || reverse) result = [].slice.call(result);
		if (reverse) result.reverse();
		return result;
	},

	getMainRouteContext(){

		if(this.mainRouteContext) return this.mainRouteContext;
		this.mainRouteContext = _(this.getRoutesContexts())
			.chain()
			.sortBy((a,b) => comparator([ [b,a, c => c.main], [a,b, c => c.order] ]))
			.take(1)
			.value()[0];

		return this.mainRouteContext;
	}
};

const BasePage = mix(MnObject).with(Mixin, ChildrenableMixin, StartableMixin, RoutesMixin);

var index$22 = BasePage.extend({
	constructor(opts = {}){
		BasePage.apply(this, arguments);

		this.mergeOptions(opts, ['root','parent','router','canNotStart','onStart','onBeginStart', 'onBeforeStart', 'onEndStart', 'onStop', 'onBeginStop', 'onBeforeStop', 'onEndStop']);
		
		// resides in routes-mixin
		this.initializeRoutes();

		// resides in ChildrenableMixin
		this.initializeChildren();
		
		// resides in routes-mixin
		this.registerAllRoutes();
	},

	getLabel(){
		let result = this.getOption('label', { args: [this, this.model]});
		return result;
	},
	getMenuLabel(){
		let result = this.getOption('menuLabel', { args: [this, this.model], default: this.getLabel()});
		return result;
	},

	buildChildOptions(options){
		return _.extend({
			root: this.root,
			parent: this.parent,
			router: this.router,
		}, options);
	},

	getSiblings(opts = {}){

		let parent = this.getParent();
		let options = _.extend({ exclude: [this] }, opts);
		return parent && parent.getChildren(options) || [];

	},
	getHashes(){
		let parent = this.getParent();
		let root = this.getRoot();

		return {
			path: this.getPathHash(),
			this: this.getHash(),
			root: root && root.getHash && root.getHash() || undefined,
			parent: parent && parent.getHash && parent.getHash() || undefined,
			children: this.getChildrenHashes(),
			siblings: this.getSiblingsHashes()
		};
	},
	getPathHash(){
		let self = this.getHash();
		let path = [self];
		let parent = this.getParent();
		if (parent && _.isFunction(parent.getPathHash)) {
			path.unshift(...parent.getPathHash());
		}
		return path;
	},
	getChildrenHashes(){
		return this.getChildren({ map: i => i.getHash(), visible: true, });
	},
	getSiblingsHashes(){
		return this.getSiblings({ map: i => i.getHash(), visible: true, });
	},

	getRoot(){
		return this.root;
	},
	getAllPages(opts = {}){
		
		let options = _.extend({}, opts, { includeSelf: true });
		delete options.map;
		let pages = this.root.getAllChildren(options);

		if (_.isFunction(opts.map)) {
			return _(pages).chain().map(opts.map).filter(f => !!f).value();
		} else {
			return pages;
		}
	},

	getAllHashes(opts = {}){
		let options = _.extend({ map: i => i.getHash(), visible: true, }, opts);
		return this.getAllPages(options);
	},

	getHash(){
		let context = this.getMainRouteContext();

		if(!_.isObject(context))
			return;

		let parent = this.getParent();
		let parentCid = parent && parent.cid || undefined;		
		return {
			cid: this.cid,
			parentCid,
			url: context.route,
			label: this.getMenuLabel(),
			order: this.order,
		};
	},


	_childFilter(item, index, opts = {}) {
		let base = BasePage.prototype._childFilter;
		if(base && !base.apply(this, arguments))
			return;

		let { visible } = opts;

		if(visible && (item.visible === false || item.hidden === true))
			return;

		return item;
	},

});

// supports passing options to the callback
// by using new version of loadUrl
function historyNavigate(fragment, opts){
	
	let options = opts === true ? { trigger: true }
		: _.isObject(opts) ? _.clone(opts)
			: {};

	let { trigger } = options;	
	delete options.trigger;

	Backbone.history.navigate(fragment, options);

	if (trigger) {
		return historyLoadUrl(fragment, opts);
	}

}

// original loadUrl does not pass options to the callback
// and this one does
function historyLoadUrl(fragment, opts = {}) {

	// If the root doesn't match, no routes can match either.
	if (!Backbone.history.matchRoot()) return false;
	fragment = Backbone.history.fragment = Backbone.history.getFragment(fragment);
	let executed = executeHandler(fragment, opts);
	if (!executed) {
		errorHandler.handle('not:found', opts.context, [fragment]);
		//history.trigger('handler:not:found', fragment, opts);
	}
	return executed;
}

//TODO: think about constraints check
function testHandler(handler, fragment){
	return handler.route.test(fragment);
}

function findHandler(fragment, customTest){
	let test = _.isFunction(customTest) ? customTest : testHandler;
	fragment = Backbone.history.getFragment(fragment);
	return _.filter(Backbone.history.handlers || [], handler => test(handler, fragment))[0];
}

function executeHandler(fragment, opts = {}, resultContext = {}) {
	let handler = findHandler(fragment, opts.testHandler);
	handler && (resultContext.value = handler.callback(fragment, opts));
	return !!handler;
}

function start(options){

	if(Backbone.history.loadUrl !== historyLoadUrl)
		Backbone.history.loadUrl = historyLoadUrl;

	return Backbone.history.start(options);
}




var index$23 = Object.freeze({
	historyNavigate: historyNavigate,
	historyLoadUrl: historyLoadUrl,
	findHandler: findHandler,
	executeHandler: executeHandler,
	start: start,
	history: Backbone.history
});

var index$24 = _.extend({
	watch(){
		this.entries = [];
		this.listenTo(Backbone.history, 'route', this.onRoute);
		this.listenTo(Backbone.history, 'backroute', this.onBackRoute);
	},
	isActionContext: cntx => _.isObject(cntx) && _.isString(cntx.fragment),
	hasElements(){
		return this.entries.length > 0;
	},
	onRoute(actionContext){

		if(!this.isActionContext(actionContext))
			return;

		if (this.isActionContext(this.lastElement)) {
			this.entries.push(this.lastElement);
		}
		this.lastElement = actionContext;

	},
	onBackRoute(actionContext){
		if(!this.isActionContext(actionContext) || !this.isActionContext(actionContext.gobackContext))
			return;

		let lookFor = actionContext.gobackContext;
		let index = this.entries.indexOf(lookFor);
		if (index >= 0) {
			this.entries = this.entries.slice(0, index);
			this.lastElement = lookFor;
		}

	},
	goBack(){
		let last = this.hasElements() && _(this.entries).last();
		historyNavigate(last.fragment, { trigger: true, routeType: 'backroute', gobackContext: last });
	},
}, Backbone.Events);

function normalizeOptions(type = 'route', opts = {}){
	if(_.isObject(type)) {
		opts = type;
		type = 'route';
	} 
	return _.extend({ routeType: type, trigger: true }, opts);
}

function execute(url, opts){
	return go(url, 'execute', opts);
}
function navigate(url, opts){
	return go(url, 'route', opts);
}
function navigateBack(url, opts){
	return go(url, 'backroute', opts);
}

function go(url, type, opts)
{
	let options = normalizeOptions(type, opts);
	switch(options.routeType){
	default:
	case 'route':
	case 'backroute':
		return historyNavigate(url, options);
	case 'execute':
		return executeHandler(url, options);
	}

}


var index$25 = Object.freeze({
	execute: execute,
	navigate: navigate,
	navigateBack: navigateBack,
	go: go
});

const _disallowedKeys = ['setItem', 'key', 'getItem', 'removeItem', 'clear'];
const allowedKey = key => _disallowedKeys.indexOf(key) < 0;

const fake = {
	setItem(id, val) {
		if (!allowedKey(id)) return;
		return this[id] = String(val);
	},
	getItem(id) {
		if (!allowedKey(id)) return;
		return this[id];
	},
	removeItem(id) {
		if (!allowedKey(id)) return;
		delete this[id];
	},
	clear() {
		let keys = _(this).keys();
		_(keys).each(key => this.removeItem(key));
	}
};

let session = (typeof sessionStorage === 'undefined') 
	? fake : sessionStorage;

let local = (typeof localStorage === 'undefined') 
	? fake : localStorage;

const getStore = (opts = {}) => opts.local === true ? local : session;

const SECONDS = 1000;
const MINUTES = SECONDS * 60;
const HOURS = MINUTES * 60;
const DAYS = HOURS * 24;

var store$3 = {

	_normalizeValue(value) {
		var normValue = value;
		if (_.isObject(value) && _.isFunction(value.toJSON))
			normValue = value.toJSON();
		if (_.isDate(value) && !_.isNaN(value.valueOf()))
			normValue = 'date(' + normValue + ')';
		return normValue;
	},

	_createItem(value, expireAt) {
		return { expireAt: expireAt, value: value };
	},

	jsonParse(key, value) {
		var datePattern = /^date\((\d{4,4}-\d{2,2}-\d{2,2}([T\s]\d{2,2}:\d{2,2}:\d{2,2}(\.\d*)?Z?)?)\)$/;
		if (_.isString(value) && datePattern.test(value)) {
			var textDate = value.replace(datePattern, '$1');
			return new Date(textDate);
		}
		return value;
	},
	_jsonParse(key, value, context) {
		if (!key) return value;
		return this.jsonParse(key, value, context);
	},
	_parse(raw) {
		let _this = this;
		let item = JSON.parse(raw, function (key, value) { return _this._jsonParse(key, value, this); });
		if ('expireAt' in item && 'value' in item)
			return item;
		else
			return this._createItem(item, 0);
	},
	_get(key, opts) {
		let raw = getStore(opts).getItem(key);
		if (raw == null) return;
		return this._parse(raw);
	},
	get(key, opts = {}) {

		let { checkExpire = true } = opts;

		let item = this._get(key, opts);		
		if (item == null) return;

		let expired = this._isExpired(item);
		if (!expired || !checkExpire) {

			return item.value;
		}
		else if (expired) {
			this.remove(key, opts);
		}
	},
	set(key, value, opts = {}) {

		let expireAt = Date.now() + this.getExpireAt(opts);
		let normValue = this._normalizeValue(value);
		let item = this._createItem(normValue, expireAt);
		this._set(key, item, opts);
		
	},
	remove(key, opts) {
		getStore(opts).removeItem(key);
	},
	expire(key, opts) {
		let item = this._get(key, opts);
		if (!item) return;
		item.expireAt = 0;
		this._set(key, item, opts);
	},
	getExpireAt ({ expireAt, seconds, minutes, hours, days }) {
		if (expireAt != null)
			return expireAt;

		let offset = 0;

		_.isNumber(seconds) && (offset += seconds * SECONDS);
		_.isNumber(minutes) && (offset += minutes * MINUTES);
		_.isNumber(hours) && (offset += hours * HOURS);
		_.isNumber(days) && (offset += days * DAYS);

		offset === 0 && (offset += 10 * MINUTES);

		return offset;
	},
	_set(key, item, opts) {
		let text = JSON.stringify(item);
		getStore(opts).setItem(key, text);
	},
	isExpired(key, opts) {
		let item = this._get(key, opts);
		if (item == null) return true;
		return this._isExpired(item);
	},
	_isExpired(item) {
		return item.expireAt < Date.now();
	},
};



var index$26 = Object.freeze({
	actions: index$20,
	AppError: AppError,
	BaseObject: BaseModel,
	BearerToken: Token,
	modals: index$21,
	PageRouter: BaseRouter$2,
	Page: index$22,
	Router: Router$1,
	routeErrorHandler: errorHandler,
	historyWatcher: index$24,
	navigator: index$25,
	history: index$23,
	Process: Process,
	ViewManager: ViewManager,
	store: store$3,
	ViewStack: ViewStack,
	renderInNode: renderInNode,
	renderInNodeConfig: config,
	TextView: TextView,
	validator: validator,
	ModelSchema: ModelSchema,
	ModelSchemas: store$1,
	PropertySchema: PropertySchema
});

exports.mixins = index$19;
exports.components = index$26;
exports.utils = index$6;

return exports;

}({},Backbone,Mn));

//# sourceMappingURL=index.js.map
