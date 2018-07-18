import { Collection, Events, Model, Router, View, history } from 'backbone';
import Mn$1 from 'backbone.marionette';

var MnObject = Mn$1.Object || Mn$1.MnObject;

var knownCtors = [Model, Collection, View, Router, MnObject];

function isKnownCtor(arg) {
	var isFn = _.isFunction(arg);
	var result = _(knownCtors).some(function (ctor) {
		return arg === ctor || arg.prototype instanceof ctor;
	});
	return isFn && result;
}

function betterResult(obj, key) {
	var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	var context = opts.context,
	    args = opts.args,
	    checkAlso = opts.checkAlso,
	    force = opts.force;

	var defaultValue = opts.default;

	if (!_.isString(key) || key === '') return;

	var value = (obj || {})[key];

	if (value != null && (!_.isFunction(value) || isKnownCtor(value))) return value;

	var result = force !== false && _.isFunction(value) ? value.apply(context || obj, args) : value;

	if (result == null && _.isObject(checkAlso)) {
		var alsoOptions = _.omit(opts, 'checkAlso');
		result = betterResult(checkAlso, key, alsoOptions);
	}

	if (result == null && defaultValue != null) result = defaultValue;

	return result;
}

function getOption(context, key, opts) {
	// if (_.isFunction(context.getOption)) {
	// 	return context.getOption(key, opts);
	// } else {
	// 	opts.context = context;
	// 	let fallback = _.isFunction(context.getProperty)
	// 		? context.getProperty
	// 		: key => context[key];
	// 	return getProperty(context.options, key, opts, fallback);
	// }

	var options = _.extend({}, opts, {
		context: context
	});
	var deep = options.deep;


	var value = betterResult(context.options, key, options);
	if (value == null && deep !== false) {
		value = betterResult(context, key, options);
	}
	return value;
}

var Mixin = function Mixin(Base) {
	return Base.extend({

		//property first approach
		getProperty: function getProperty(key, opts) {

			var defaultGetArguments = betterResult(this, '_getPropertyArguments', { args: [this], default: [this] });
			var options = _.extend({
				deep: Mixin.defaults.deep,
				force: Mixin.defaults.force,
				args: defaultGetArguments
			}, opts, {
				context: this
			});
			var deep = options.deep;


			var value = betterResult(this, key, options);
			if (value == null && deep !== false) {
				value = betterResult(this.options, key, options);
			}
			return value;
		},


		//options first approach
		getOption: function getOption$$1(key, opts) {
			var defaultGetArguments = betterResult(this, '_getOptionArguments', { args: [this], default: [this] });
			var options = _.extend({
				deep: Mixin.defaults.deep,
				force: Mixin.defaults.force,
				args: defaultGetArguments
			}, opts);

			return getOption(this, key, options);
		},
		mergeOptions: function mergeOptions() {
			var values = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			var _this = this;

			var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
			var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


			if (_.isString(keys)) keys = keys.split(/\s*,\s*/);

			_.each(keys, function (key) {
				var option = betterResult(values, key, opts);
				if (option !== undefined) {
					_this[key] = option;
				}
			});
		}
	}, {
		GetOptionMixin: true
	});
};

Mixin.defaults = {
	deep: true,
	force: true
};

function createProcessContext(context, name) {
	var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
	var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


	var cancelation = {};
	cancelation.promise = new Promise(function (resolve, reject) {
		cancelation.cancel = function () {
			return reject('cancel');
		};
	});

	var result = _.extend({
		cid: _.uniqueId('process'),
		name: name,
		context: context,
		args: args,
		errors: [],
		cancelation: cancelation,
		shouldCatch: false
	}, opts);

	return result;
}

// camelCase('asd:qwe:zxc') -> asdQweZxc
// camelCase('asd:qwe:zxc', true) -> AsdQweZxc
function camelCase(text, first) {
	if (!_.isString(text)) return text;
	var splitter = first === true ? /(^|:)(\w)/gi : /(:)(\w)/gi;
	return text.replace(splitter, function (match, prefix, text) {
		return text.toUpperCase();
	});
}

function executingProcessFlagKey(name) {
	return camelCase('_process:' + name + ':executing');
}

function processConcurrencyCheck(processContext) {

	var executingKey = executingProcessFlagKey(processContext.name);
	var previous = processContext.context[executingKey];
	if (!previous) return;

	var concurrent = processContext.concurrent;

	if (concurrent === false) {

		processContext.cancel();
	} else if (concurrent == 'first') {

		return previous.promise;
	} else if (concurrent == 'last') {

		previous.cancelation.cancel();
	}
}

var triggerMethodOn = Mn$1.triggerMethodOn;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};























































var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

function invokeOnContext(processContext, methodName) {
	var method = camelCase(methodName);
	var context = processContext.context;
	var args = processContext.args;
	return betterResult(context, method, { args: args });
}

function triggerOnContext(processContext, eventName) {
	for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
		args[_key - 2] = arguments[_key];
	}

	var context = processContext.context;
	if (!_.isFunction(context.trigger)) return;

	var event = processContext.name + (eventName ? ':' + eventName : '');

	(!args || !args.length) && (args = processContext.args || []);

	triggerMethodOn.apply(undefined, [context, event].concat(toConsumableArray(args)));
}

function triggerBegin(processContext) {
	var _processContext$onBeg;

	var beginError = _.isFunction(processContext.onBegin) && (_processContext$onBeg = processContext.onBegin).call.apply(_processContext$onBeg, [processContext.context].concat(toConsumableArray(processContext.args)));
	if (beginError) return beginError;

	var key = executingProcessFlagKey(processContext.name);
	processContext.context[key] = processContext;
	triggerOnContext(processContext, 'begin');
}
function triggerBefore(processContext) {

	triggerOnContext(processContext, 'before');
}
function triggerComplete(processContext) {
	var _processContext$onCom;

	triggerOnContext(processContext);
	if (_.isFunction(processContext.onComplete)) (_processContext$onCom = processContext.onComplete).call.apply(_processContext$onCom, [processContext.context].concat(toConsumableArray(processContext.args)));
	triggerOnContext(processContext, 'end');
}
function triggerError(processContext, errors) {
	var _processContext$error, _processContext$onErr;

	if (!_.isArray(errors)) errors = [errors];

	(_processContext$error = processContext.errors).push.apply(_processContext$error, toConsumableArray(errors));

	triggerOnContext.apply(undefined, [processContext, 'error'].concat(toConsumableArray(processContext.errors)));
	if (_.isFunction(processContext.onError)) (_processContext$onErr = processContext.onError).call.apply(_processContext$onErr, [processContext.context].concat(toConsumableArray(processContext.errors)));

	triggerOnContext(processContext, 'end');
}

function isPromisable(arg) {
	return arg instanceof Promise || _.isFunction(arg && arg.then);
}

function asArray(arg) {
	if (_.isArray(arg)) return arg;else if (arg == null || arg === '') return [];else return [arg];
}

function getCanNotRunPromise(processContext) {

	var contextMethod = 'can:not:' + processContext.name;
	var promise = invokeOnContext(processContext, contextMethod);

	if (promise == null || promise === '') {

		promise = Promise.resolve();
	} else if (!isPromisable(promise)) {

		promise = Promise.reject(promise);
	}

	return Promise.race([processContext.cancelation.promise, promise]);
}

function getWaitPromise(processContext) {

	var contextMethod = 'get:' + processContext.name + ':promises';
	var promises = asArray(invokeOnContext(processContext, contextMethod));

	return Promise.race([processContext.cancelation.promise, Promise.all(promises)]);
}

function process(processContext) {

	var promise = new Promise(function (resolve, reject) {
		var shouldExit = false;
		var rejectWithError = function rejectWithError(error) {
			triggerError(processContext, error);
			reject(processContext);
			shouldExit = true;
		};

		Promise.race([processContext.cancelation.promise, Promise.resolve()]).catch(rejectWithError);

		if (shouldExit) return;

		var beginError = triggerBegin(processContext);
		if (beginError) {
			rejectWithError(beginError);
			return;
		}

		var canBeRuned = getCanNotRunPromise(processContext);
		canBeRuned.then(function () {
			triggerBefore(processContext);
			var waitFor = getWaitPromise(processContext);
			return waitFor.then(function () {
				triggerComplete(processContext);
				resolve();
			});
		}).catch(rejectWithError);
	});
	processContext.promise = promise.catch(function (context) {
		var error = void 0;
		if (context instanceof Error) {
			triggerError(processContext, context);
			throw context;
		}
		if (context && context.errors && context.errors.length == 1 && context.errors[0] instanceof Error) {
			error = context.errors[0];
			return Promise.reject(error);
		}

		if (processContext.shouldCatch) return context;else return Promise.reject(context);
	});
	return promise;
}

//import engine from './engine';
function initializeProcess(context, name, opts) {

	context[name] = function () {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		var processContext = createProcessContext(context, name, args, opts);

		var concurrent = processConcurrencyCheck(processContext);
		if (concurrent) {
			return concurrent;
		} else {
			return process(processContext);
		}
	};
}

var StartableMixin = (function (Base) {
	return Base.extend({
		constructor: function constructor() {
			Base.apply(this, arguments);
			initializeProcess(this, 'start');
			initializeProcess(this, 'stop');
		}
	});
});

var ChildrenableMixin = (function (Base) {
	return Base.extend({
		constructor: function constructor(opts) {

			Base.apply(this, arguments);
			this._initializeChildrenable(opts);
		},
		_initializeChildrenable: function _initializeChildrenable(opts) {
			this.mergeOptions(opts, ['parent', 'root']);
			if (this.parent == null && this.root == null) this.root = this;
		},


		//call this method manualy for initialize children
		initializeChildren: function initializeChildren() {
			var _this = this;

			if (this._childrenInitialized) return;

			var children = this.getOption('children');
			this._children = [];
			_(children).each(function (child) {
				return _this._initializeChild(child);
			});

			this._childrenInitialized = true;
		},
		_initializeChild: function _initializeChild(arg) {
			var Child = void 0;
			var options = {};

			if (isKnownCtor(arg)) Child = arg;else if (_.isFunction(arg)) {

				var invoked = arg.call(this, this);
				return this._initializeChild(invoked);
			} else if (_.isObject(arg)) {
				Child = arg.Child;
				_.extend(options, _.omit(arg, 'Child'));
			}

			if (!isKnownCtor(arg)) return;

			_.extend(options, this.getOption('childOptions'), { parent: this });
			options = this.buildChildOptions(options);

			var child = new Child(options);
			this._children.push(child);
		},
		buildChildOptions: function buildChildOptions(options) {
			return options;
		},
		getChildren: function getChildren() {
			return this._children || [];
		},
		getParent: function getParent() {
			return this.parent;
		}
	});
});



var index = Object.freeze({
	getOption: Mixin,
	startable: StartableMixin,
	childrenable: ChildrenableMixin
});

function getNestedResult(value, context, schema) {
	return value != null && _.isFunction(schema.nested) && schema.nested(value, context);
}

function getPropertySchema(model, key) {
	if (_.isFunction(model.getPropertySchema)) {
		return model.getPropertySchema(key);
	} else {
		return {};
	}
}

function getDisplayConfig(key, model, schema) {
	if (key == null) return {};
	return _.isFunction(model.getPropertyDisplayConfig) && model.getPropertyDisplayConfig(key) || schema.display || {};
}

function isModel(arg) {
	return arg instanceof Model;
}

function getProperty(context, name) {
	if (context == null || !_.isObject(context) || name == null || name == '') return;
	if (isModel(context)) return context.get(name, { gettingByPath: true });else return context[name];
}

function getByPathArray(context, propertyName, pathArray) {

	if (context == null || !_.isObject(context) || propertyName == null || propertyName == '') return;

	var prop = getProperty(context, propertyName);

	if (!pathArray.length || pathArray.length && prop == null) return prop;

	var nextName = pathArray.shift();

	return getByPathArray(prop, nextName, pathArray);
}

function getByPath(obj, path) {

	if (obj == null || !_.isObject(obj) || path == null || path == '') return;

	var pathArray = _.isString(path) ? path.split('.') : _.isArray(path) ? [].slice.call(path) : [path];

	var prop = pathArray.shift();

	return getByPathArray(obj, prop, pathArray);
}

var index$1 = (function (Base) {
	var originalGet = Model.prototype.get;
	var Mixed = Base.extend({
		getByPath: function getByPath$$1(key) {
			if (key.indexOf('.') > -1) return getByPath(this, key);else return originalGet.call(this, key);
		},
		get: function get(key) {
			var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			if (key == null || key == '') return;

			var value = 'value' in opts ? opts.value : this.getByPath.call(this, key);

			if (!_.size(opts)) {
				return value;
			}

			var prop = getPropertySchema(this, key);
			var result = opts.nested && getNestedResult(value, this, prop);
			if (result != null) {
				return result;
			}

			if (_.isFunction(opts.transform) && !opts.raw) {
				value = opts.transform.call(this, value, opts, this);
			}

			if (_.isFunction(prop.transform) && !opts.raw) {
				value = prop.transform.call(this, value, opts, this);
			}

			if (opts.display === true) {

				var display = getDisplayConfig(key, this, prop);

				if (opts.alternative) {
					value = _.isFunction(display.alternative) && display.alternative.call(this, value, _.extend({}, opts, prop), this);
				} else if (_.isFunction(display.transform)) {
					value = display.transform.call(this, value, opts, this);
				}
				if (display.ifEmpty && (value == null || value === '')) return display.ifEmpty;
			}

			return value;
		},
		display: function display(key) {
			var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			_.extend(opts, { display: true });
			return this.get(key, opts);
		}
	});

	return Mixed;
});



var index$2 = Object.freeze({
	smartGet: index$1
});

var defaultCssConfig = {
	beforeRender: true,
	modelChange: true,
	refresh: true
};

var index$3 = (function (Base) {
	return Base.extend({
		constructor: function constructor() {
			Base.apply(this, arguments);
			this._setupCssClassModifiers();
		},
		refreshCssClass: function refreshCssClass() {
			var className = this._getCssClassString();
			if (className == '') {
				this.$el.removeAttr('class');
			} else {
				this.$el.attr({
					class: className
				});
			}
		},
		_getCssClassModifiers: function _getCssClassModifiers() {
			var optsModifiers = this.getOption('cssClassModifiers', { deep: false, args: [this.model, this] });
			var propsModifiers = this.getProperty('cssClassModifiers', { deep: false, args: [this.model, this] });
			var modifiers = [this.getOption('className')].concat(optsModifiers || [], propsModifiers || []);
			return modifiers;
		},

		//override this if you need other logic
		getCssClassModifiers: function getCssClassModifiers() {
			return this._getCssClassModifiers();
		},
		_getCssClassString: function _getCssClassString() {
			var _this = this;

			var modifiers = this.getCssClassModifiers();
			var classes = _(modifiers).map(function (cls) {
				return _.isString(cls) ? cls : _.isFunction(cls) ? cls.call(_this, _this.model, _this) : null;
			});
			var ready = _(classes).filter(function (f) {
				return f != null && f != '';
			});
			var className = _.uniq(ready).join(' ');
			return (className || '').trim();
		},
		_setupCssClassModifiers: function _setupCssClassModifiers() {
			var _this2 = this;

			if (this._cssClassModifiersInitialized) return;

			var cfg = this.getCssClassConfig();
			if (!cfg) return;

			var events = this.getCssClassEvents(cfg);
			_(events).each(function (eventName) {
				return _this2.on(eventName, _this2.refreshCssClass);
			});

			if (cfg.modelChange && this.model) {
				this.listenTo(this.model, 'change', this.refreshCssClass);
			}

			this._cssClassModifiersInitialized = true;
		},
		_getCssClassConfig: function _getCssClassConfig() {
			var cfg = _.extend({}, defaultCssConfig, this.getOption('cssClassConfig'));
			if (!cfg || _.size(cfg) == 0) return;
			return cfg;
		},

		//override this if you need other logic
		getCssClassConfig: function getCssClassConfig() {
			return this._getCssClassConfig();
		},
		_getCssClassEvents: function _getCssClassEvents(cfg) {
			var events = [].concat(cfg.events || []);
			if (cfg.refresh) events.push('refresh');
			if (cfg.beforeRender) events.push('before:render');
			events = _(events).uniq();
			return events;
		},

		//override this if you need other logic
		getCssClassEvents: function getCssClassEvents(cfg) {
			return this._getCssClassEvents(cfg);
		}
	});
});

var defaultSelector = function defaultSelector(name) {
	var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
	return prefix + 'region-' + name;
};

function defaultUpdateDom(name, $el) {
	var selector = defaultSelector(name);
	var element = $('<div>').addClass(selector);
	$el.append(element);

	return '.' + selector;
}

function buildRegionFunc(view, hash, context) {
	var $el = view.$el;
	var autoCreateRegion = context.autoCreateRegion;
	var updateDom = hash.updateDom,
	    name = hash.name,
	    el = hash.el;

	var regionEl = void 0;

	var region = view.getRegion(name);

	if (el == null && autoCreateRegion !== false) {

		var testEl = region && region.getOption('el', { deep: false });

		if (!region || !testEl || !$el.find(testEl).length) {

			regionEl = defaultUpdateDom(name, $el);
		}
	} else if (_.isFunction(updateDom)) {
		updateDom.call(view, $el, view);
	}

	if (!region) {
		var definition = _.pick(hash, 'replaceElement', 'regionClass');
		definition.el = hash.el || regionEl;
		region = view.addRegion(name, definition);
	}

	return region;
}

function normalizeNestedViewContextRegion(context) {
	var region = context.region;

	var regionName = _.isString(region) && region || context.regionName || context.name;

	if (_.isString(region) || region == null) {
		region = {};
	} else if (_.isFunction(region)) {
		region = region.call(this, context, this);
	}

	if (_.isObject(region)) {

		if (!region.name) region.name = regionName;
		var replaceElement = this.getOption('replaceNestedElement');
		context.region = _.extend({ replaceElement: replaceElement }, region);
		context.show = _.partial(buildRegionFunc, this, context.region, context);
	}
	return context;
}

function isView(arg) {
	return arg instanceof View;
}

function isViewClass(arg) {
	return _.isFunction(arg) && (arg == View || isView(arg.prototype));
}

var index$4 = (function (Base) {
	return Base.extend({
		constructor: function constructor() {
			this._nestedViews = {};
			Base.apply(this, arguments);
			this.initializeNestedViews();
		},

		template: false,

		showAllNestedViewsOnRender: false,
		showNestedViewOnAdd: false,
		replaceNestedElement: true,

		initializeNestedViews: function initializeNestedViews() {
			var _this = this;

			if (this._nestedViewsInitialized) return;

			if (this.getOption('showAllNestedViewsOnRender')) {
				this.on('render', function () {
					return _this.showAllNestedViews();
				});
			}

			var nesteds = this.getOption('nestedViews', { args: [this.model, this] });
			_(nesteds).each(function (context, index) {

				var name = _.isString(index) ? index : context.name || _.uniqueId('nested');
				_this.addNestedView(name, context);
			});

			this._nestedViewsInitialized = true;
		},
		_normalizeNestedContext: function _normalizeNestedContext(name, context) {

			if (isViewClass(context)) {
				var View$$1 = context;
				context = {
					name: name, View: View$$1
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
		_createNestedContext: function _createNestedContext(context) {
			var contexts = this.getNestedViewContext();
			contexts[context.name] = context;
		},
		addNestedView: function addNestedView(name, context) {

			if (!_.isString(name) || name === '') {
				throw new Error('addNestedView: first argument should be a string');
			}

			context = this._normalizeNestedContext(name, context);
			this._createNestedContext(context);
			if (this.getOption('showNestedViewOnAdd') && this.isRendered()) {
				this.showNestedView(context);
			}
		},
		showNestedView: function showNestedView(name) {
			var region = this.getNestedViewRegion(name);
			var view = region && this.buildNestedView(name);
			if (view) {
				region.show(view);
			}
		},
		showAllNestedViews: function showAllNestedViews() {
			var _this2 = this;

			var contexts = this.getNestedViewContext();
			_(contexts).each(function (context) {
				return _this2.showNestedView(context);
			});
		},
		getNestedViewContext: function getNestedViewContext(name) {
			var contexts = this._nestedViews;
			if (arguments.length == 0) return contexts;else return contexts[name];
		},
		buildNestedView: function buildNestedView(name) {

			var context = _.isObject(name) ? name : _.isString(name) ? this.getNestedViewContext(name) : null;

			if (!context) return;

			if (_.isFunction(context.template)) return context.template;else {
				var View$$1 = context.View;
				var options = this.buildNestedViewOptions(betterResult(context, 'options', { context: this, args: [this, this.model], default: {} }));

				return new View$$1(options);
			}
		},
		buildNestedViewOptions: function buildNestedViewOptions(opts) {
			return opts;
		},
		getNestedViewRegion: function getNestedViewRegion(name) {
			var context = _.isObject(name) ? name : _.isString(name) ? this.getNestedViewContext(name) : null;
			return context && _.result(context, 'show');
		}
	});
});



var index$5 = Object.freeze({
	cssClassModifiers: index$3,
	nestedViews: index$4
});

function triggerControlEvent(control, event) {

	//let control = _control.getParentControl() || _control;

	var name = control.getControlName();
	var eventName = name + ':' + event;
	var method = _.isFunction(control.triggerMethod) ? control.triggerMethod : _.isFunction(control.trigger) ? control.trigger : function () {};

	for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
		args[_key - 2] = arguments[_key];
	}

	method.call.apply(method, [control, eventName].concat(args));

	control.proxyControlEventToParent.apply(control, [eventName].concat(args));
}

function getTriggerValue(control) {
	var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];


	var value = args.length ? args[0] : control.getControlValue();

	if (_.isFunction(control.convertValue)) value = control.convertValue(value);

	return value;
}

var ControlMixin = (function (Base) {
	return Base.extend({
		getControlValue: function getControlValue() {
			return this.value;
		},
		setControlValue: function setControlValue(value) {
			this.value = value;
		},
		getControlName: function getControlName() {
			return getOption(this, 'controlName', { args: [this] }) || 'control';
		},
		getParentControl: function getParentControl() {
			return getOption(this, 'proxyTo', { args: [this] });
		},
		triggerChildControlEvent: function triggerChildControlEvent(eventName) {
			var events = getOption(this, 'childControlEvents', { args: [this] }) || {};
			if (_.isFunction(events[eventName])) {
				for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
					args[_key - 1] = arguments[_key];
				}

				events[eventName].apply(this, args);
			}
		},
		tryValidateControl: function tryValidateControl(value) {
			var validate = getOption(this, 'validateControl', { force: false });
			if (_.isFunction(validate)) return validate.call(this, value, this);
		},
		triggerControlChange: function triggerControlChange() {
			this._triggerControlEvent('change', arguments);
		},
		triggerControlDone: function triggerControlDone() {
			this._triggerControlEvent('done', arguments);
		},
		_isValueAsPrevious: function _isValueAsPrevious(value, type) {
			var previousTriggerName = this.getPreviousTriggerValueKey(type);
			if (previousTriggerName in this) {
				return JSON.stringify(this[previousTriggerName]) === JSON.stringify(value);
			}
		},
		isValueAsPrevious: function isValueAsPrevious(value, type) {
			return this._isValueAsPrevious(value, type);
		},
		setPreviousTriggerValue: function setPreviousTriggerValue(value, type) {
			var key = this.getPreviousTriggerValueKey(type);
			this[key] = value;
		},
		getPreviousTriggerValueKey: function getPreviousTriggerValueKey(type) {
			return camelCase('_previous:' + type);
		},
		_triggerControlEvent: function _triggerControlEvent(eventName, args) {

			var triggerValue = getTriggerValue(this, args);
			if (this.isValueAsPrevious(triggerValue, eventName)) {
				return;
			}
			var errors = this.tryValidateControl(triggerValue);
			if (!errors) {
				this.setPreviousTriggerValue(triggerValue, eventName);
				triggerControlEvent(this, eventName, triggerValue);
			} else {
				this.triggerControlInvalid(errors);
			}
		},
		triggerControlInvalid: function triggerControlInvalid(errors) {
			triggerControlEvent(this, 'invalid', errors);
		},
		proxyControlEventToParent: function proxyControlEventToParent(eventName) {
			var parent = this.getParentControl();
			if (parent && _.isFunction(parent.triggerChildControlEvent)) {
				for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
					args[_key2 - 1] = arguments[_key2];
				}

				parent.triggerChildControlEvent.apply(parent, [eventName].concat(toConsumableArray(args)));
			}
		}
	}, {
		ControlMixin: true
	});
});

var _getOption = function _getOption(context, key, checkAlso) {
	return getOption(context, key, { args: [context], checkAlso: checkAlso });
};

function getInputType(inputView) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


	var valueType = _getOption(inputView, 'valueType', opts);
	if (valueType == null) {
		var value = inputView.getControlValue();
		if (value == null) {
			valueType = 'string';
		} else {
			if (_.isNumber(value)) valueType = 'number';else if (_.isDate(value)) valueType = 'datetime';else valueType = 'string';
		}
	}

	if (valueType == 'number') {
		inputView._valueIsNumber = true;
	}

	var type = _getOption(inputView, 'inputType', opts);

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

function setInputAttributes(inputView) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


	var attributes = getOption(inputView, 'attributes', { checkAlso: opts, args: [inputView] });

	var restrictionKeys = {
		'maxLength': 'maxlength',
		'minValue': 'min',
		'maxValue': 'max',
		'valuePattern': 'pattern',
		'required': 'required',
		'value': 'value'
	};
	var restrictions = {};
	_(restrictionKeys).each(function (key2, key) {
		var value = getOption(inputView, key, { checkAlso: opts, args: [inputView] });
		if (value != null) restrictions[key2] = value;
	});

	inputView.attributes = _.extend({
		value: inputView.value,
		type: getInputType(inputView, opts)
	}, restrictions, attributes);
}

var getOption$1 = (function (context, key, ifNull) {
  return getOption(key, { args: [context], default: ifNull });
});

function isChar(event) {
	return event.key && event.key.length == 1 && !event.ctrlKey;
}

function keydown (eventContext) {
	var context = eventContext.context,
	    event = eventContext.event;

	var prevent = false;
	var stop = false;

	if (isChar(event)) {
		if (!context.isEnteredCharValid(event.key)) {
			prevent = true;
		}
	}
	if (event.keyCode == 13 && getOption$1(context, 'doneOnEnter', true)) {
		prevent = true;
		stop = true;
	}

	stop && event.stopPropagation();
	prevent && event.preventDefault();
}

function keyup (eventContext) {
	var context = eventContext.context,
	    event = eventContext.event;


	if (event.keyCode == 13 && getOption$1(context, 'doneOnEnter', true)) {
		context.triggerControlDone();
		event.stopPropagation();
		event.preventDefault();
	}
}

function paste (eventContext) {
	var context = eventContext.context,
	    event = eventContext.event;

	var text = event.originalEvent.clipboardData.getData('text/plain');
	if (!text) return;
	if (!context.isValueValid(text)) {
		event.preventDefault();
		event.stopPropagation();
	}
}

function blur (eventContext) {
	var context = eventContext.context;

	if (getOption$1(context, 'doneOnBlur', true)) {
		context.triggerControlDone();
	}
}

function focus (eventContext) {
	var context = eventContext.context,
	    input = eventContext.input;

	if (getOption$1(context, 'selectOnFocus', true)) {
		input.select();
	}
}

function input (eventContext) {
	var context = eventContext.context,
	    input = eventContext.input,
	    event = eventContext.event;


	var newvalue = context.setControlValue(event.target.value);
	if (event.target.value != (newvalue || '').toString()) {
		input.value = newvalue;
	}
	//context.triggerControlChange();
}

//import jsChange from './js-change';
var eventHandlers = {
	keydown: keydown,
	//keypress,
	keyup: keyup,
	paste: paste,
	blur: blur,
	focus: focus,
	input: input
	//'js:change': jsChange
};

function handleInputEvent(control, eventName, event) {
	var options = _.extend({
		context: control,
		input: control.el,
		restrictions: control.restrictions,
		eventName: eventName,
		event: event
	});

	var method = camelCase('on:dom:' + eventName);

	if (_.isFunction(eventHandlers[eventName])) {
		eventHandlers[eventName].call(control, options);
	}

	if (_.isFunction(control[method])) {
		control[method](event, options);
	}
}

var _getOption$1 = function _getOption(context, key, checkAlso) {
	return getOption(context, key, { args: [context], checkAlso: checkAlso });
};

function setInputEvents(inputView) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


	var passedEvents = _getOption$1(inputView, 'events', opts);

	var eventsArray = _(eventHandlers).keys();
	var events = _.reduce(eventsArray, function (Memo, eventName) {
		Memo[eventName] = function (event) {
			handleInputEvent(this, eventName, event);
		};
		return Memo;
	}, {});
	inputView.events = _.extend(events, passedEvents);
}

function toNumber(text) {
	if (_.isNumber(text)) return text;
	if (!_.isString(text)) return;

	var value = parseFloat(text, 10);
	if (isNaN(value)) value = undefined;

	return value;
}

var defaultOptions = {
	nullable: true,
	strict: false,
	returnNullAs: undefined,
	returnEmptyAs: undefined,
	returnNullAndEmptyAs: undefined,
	returnAnyAs: undefined,
	returnOtherAs: undefined
};

var trueValues = ['true', '1', '-1', 'yes'];
var falseValues = ['false', '0', 'no'];

var alternative = function alternative() {
	var returnValue = void 0;

	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	_(args).some(function (arg) {
		if (_.isBoolean(arg)) {
			returnValue = arg;
			return true;
		}
	});
	return returnValue;
};

var valueOrAlternative = function valueOrAlternative(nullable, nullValue, value) {
	for (var _len2 = arguments.length, alts = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
		alts[_key2 - 3] = arguments[_key2];
	}

	var alt = alternative.apply(undefined, alts);
	if (alt != null) return alt;else if (nullable) return nullValue;else return value;
};

var convertToBoolean = function convertToBoolean(arg) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


	var other = void 0;
	var options = _.extend({}, defaultOptions, opts);
	var nullable = options.nullable,
	    strict = options.strict,
	    returnNullAs = options.returnNullAs,
	    returnEmptyAs = options.returnEmptyAs,
	    returnNullAndEmptyAs = options.returnNullAndEmptyAs,
	    returnAnyAs = options.returnAnyAs,
	    returnOtherAs = options.returnOtherAs;


	if (arg == null) {
		return valueOrAlternative(nullable, undefined, false, returnNullAs, returnNullAndEmptyAs);
	} else if (arg === '') {
		return valueOrAlternative(nullable, undefined, false, returnEmptyAs, returnNullAndEmptyAs);
	} else if (_.isBoolean(arg)) {
		return arg;
	}
	//  else if (_.isObject(arg)) {
	// }

	other = strict ? nullable ? undefined : false : true;

	var text = arg.toString().toLowerCase();
	var isTrue = convertToBoolean.trueValues.indexOf(text) > -1;
	var isFalse = convertToBoolean.falseValues.indexOf(text) > -1;

	if (_.isBoolean(returnAnyAs)) {
		return returnAnyAs;
	} else if (_.isBoolean(returnOtherAs)) {
		other = returnOtherAs;
	}

	return isTrue ? true : isFalse ? false : other;
};

convertToBoolean.trueValues = trueValues;
convertToBoolean.falseValues = falseValues;

//this is under development yet and can be change in any time
function convertString(text, type, opts) {

	switch (type) {
		case 'number':
			return toNumber(text, opts);
		case 'boolean':
			return convertToBoolean(text, opts);
		default:
			return text;
	}
}

var index$6 = (function (Base) {

	var Mixin = Base.ControlMixin ? Base : ControlMixin(Base);

	return Mixin.extend({
		constructor: function constructor(opts) {

			setInputAttributes(this, opts);
			setInputEvents(this, opts);
			Mixin.apply(this, arguments);

			if (!_.isFunction(this.getOption)) {
				this.getOption = _.partial(getOption, this, _, { args: [this] });
			}

			this.buildRestrictions();
			var value = this.getOption('value') || '';
			this.el.value = value;
			this.setControlValue(value);
		},

		tagName: 'input',
		template: false,
		buildRestrictions: function buildRestrictions() {
			var attrs = _.result(this, 'attributes');
			var pickNumbers = ['maxlength', 'min', 'max'];
			var pickStrings = ['pattern'];
			var pickBools = ['required'];
			var restrictions = {};
			_(attrs).each(function (value, key) {
				var pick = false;
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
		setControlValue: function setControlValue(value) {
			var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			this.value = this.prepareValueBeforeSet(value);
			if (!opts.silent) this.triggerControlChange();
			return this.value;
		},
		prepareValueBeforeSet: function prepareValueBeforeSet(value) {
			if (value == null || value === '') return value;

			var len = this.getMaxLength();
			if (len > 0) {
				value = value.toString().substring(0, len);
			}
			if (this._valueIsNumber) {
				var num = convertString(value, 'number');
				if (isNaN(num)) return;
				var min = this.restrictions.min;
				var max = this.restrictions.max;
				!isNaN(min) && num < min && (num = min);
				!isNaN(max) && num > max && (num = max);
				return num;
			}
			return value;
		},
		getValueType: function getValueType() {
			return this.valueType;
		},
		convertValue: function convertValue(value) {
			return convertString(value, this.getValueType());
		},
		getMaxLength: function getMaxLength() {
			return this.restrictions.maxlength;
		},
		isLengthValid: function isLengthValid() {
			var value = this.getControlValue();
			var len = this.getMaxLength();
			return len == null || value.length < len;
		},
		isEnteredCharValid: function isEnteredCharValid(char) {
			var type = this.getValueType();

			if (type == 'number') {
				return ['.', '-'].indexOf(char) > -1 || !isNaN(parseInt(char, 10));
			} else {
				return true;
			}
		},
		isValueValid: function isValueValid(value) {
			var type = this.getValueType();
			if (type == 'number') {
				return !isNaN(parseFloat(value, 10));
			} else {
				return true;
			}
		},
		validateControlValue: function validateControlValue(value) {
			if (value == null || value === '') {
				if (this.restrictions.required) return 'required';else return;
			}
			var strValue = value.toString();
			if (_.isNumber(this.restrictions.maxlength) && strValue.length > this.restrictions.maxlength) return 'length:big';
			if (this._valueIsNumber) {
				if (!_.isNumber(value)) return 'not:number';
				if (_.isNumber(this.restrictions.min) && value < this.restrictions.min) return 'less:than:min';
				if (_.isNumber(this.restrictions.max) && value > this.restrictions.max) return 'greater:than:max';
			}
			if (this.restrictions.pattern) {
				var pattern = RegExp(this.restrictions.pattern);
				if (pattern.test(strValue)) {
					return 'pattern:mismatch';
				}
			}
		}
	});
});



var index$7 = Object.freeze({
	control: ControlMixin,
	input: index$6
});



var index$8 = Object.freeze({
	common: index,
	model: index$2,
	view: index$5,
	controls: index$7
});

var defaultOptions$1 = {
	mergeObjects: true,
	wrapObjectWithConstructor: true
};

function createMixinFromObject(arg) {
	var obj = _.clone(arg);
	return function (Base) {
		if (_.isFunction(obj.constructor)) {
			var providedCtor = obj.constructor;
			obj.constructor = function () {
				Base.apply(this, arguments);
				providedCtor.apply(this, arguments);
			};
		}
		return Base.extend(obj);
	};
}

function normalizeArguments(args) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	var raw = {};
	var wrap = opts.wrapObjectWithConstructor == true;
	var merge = opts.mergeObjects == true;
	var mixins = [];
	_(args).each(function (arg) {

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
		if (!merge || wrap && _.isFunction(arg.constructor)) {
			mixins.push(createMixinFromObject(arg));
		} else {
			_.extend(raw, arg);
		}
	});

	//if rawObject is not empty
	//convert it to a mixin function
	//and put it to the begin of mixins array
	if (_.size(raw)) mixins.unshift(createMixinFromObject(raw));

	return mixins;
}

function withMethod() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	var mixins = normalizeArguments(args, this.options);
	var Mixed = this.class;
	if (!mixins.length) return Mixed;else return _.reduce(mixins, function (Memo, Ctor) {
		return Ctor(Memo);
	}, Mixed);
}

//import Mn from 'backbone.marionette';
var extend = Mn.extend;

function mix(_ctor, options) {

	var opts = _.extend({}, defaultOptions$1, options);

	var ctor = void 0;
	if (_.isFunction(_ctor)) {
		ctor = _ctor;
	} else if (_.isObject(_ctor)) {
		ctor = function ctor() {};
		_.extend(ctor.prototype, _ctor);
	} else {
		throw new Error('Mix argument should be a class or a plain object');
	}

	if (!_.isFunction(ctor.extend)) ctor.extend = extend;

	return {
		options: opts,
		with: withMethod,
		class: ctor
	};
}

function pstoSetPair(context, pair) {
	if (!_.isString(pair)) return;
	var keyvalue = pair.split('=');
	var key = keyvalue.shift();
	var value = keyvalue.join('=');
	pstoSetKeyValue(context, key, value);
}

function pstoSetKeyValue(context, key, value) {

	if (key == null) return;
	key = decodeURIComponent(key);
	value != null && (value = decodeURIComponent(value));

	if (!(key in context)) return context[key] = value;

	!_.isArray(context[key]) && (context[key] = [context[key]]);

	context[key].push(value);

	return context[key];
}

function paramsToObject(raw) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { emptyObject: true };

	var result = {};
	if (!_.isString(raw)) return opts.emptyObject ? result : raw;

	var pairs = raw.split('&');
	_(pairs).each(function (pair) {
		return pstoSetPair(result, pair);
	});

	return result;
}

function get$1(router) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var key = arguments[2];
	var update = arguments[3];


	var value = betterResult(opts, key, { context: router, args: [router] });
	if (value == null) {
		value = router.getOption(key, { args: [router] });
		if (update) opts[key] = value;
	}
	return value;
}

// converts route method arguments to plain object;
// _normalizeRegisterRouteArguments
// { route, rawRoute, callback, name }
function routeArgumentsToObject(router, route, name, callback) {
	var opts = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};


	var context = {};

	if (_.isObject(route)) {
		context = route;
		//_.extend(context, route);
		//then second argument is probably options;
		_.extend(opts, name);
	} else if (_.isFunction(name)) {
		_.extend(context, { route: route, callback: name, name: _.uniqueId('routerAction') });
	} else {
		_.extend(context, { route: route, name: name, callback: callback });
	}

	var isRouterHoldsActions = get$1(router, opts, 'isRouterHoldsActions', true);
	//let isRouteChaining = get(router, opts, 'isRouteChaining', true);

	// !_(opts).has('isRouterHoldsActions') && (opts.isRouterHoldsActions = this.getOption('isRouterHoldsActions'));
	// !_(opts).has('isRouteChaining') && (opts.isRouteChaining = this.getOption('isRouteChaining'));


	// last chance to get callback from router instance by name
	// this behavior can be disabled through `isRouterHoldsActions` options
	if (!_.isFunction(context.callback) && isRouterHoldsActions && _.isFunction(router[context.name])) {

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

function createActionContext(router, routeContext, fragment) {
	var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


	var rawArgs = router._extractParameters(routeContext.route, fragment);

	var result = _.extend({}, routeContext, { fragment: fragment, rawArgs: rawArgs }, options, { options: options });

	var args = rawArgs.slice(0);
	var queryString = args.pop();

	_.extend(result, { qs: prepareActionQueryString(router, queryString) });
	_.extend(result, { args: prepareActionArguments(routeContext.rawRoute, args) });

	if (result.routeType == null) {
		result.routeType = 'route';
	}

	return result;
}

function prepareActionQueryString(router, queryString) {
	if (_.isString(queryString)) return router.queryStringParser(queryString);else return {};
}

function prepareActionArguments(rawRoute, args) {

	var params = rawRoute.match(/:([^/|)]+)/g) || [];

	var res = {};
	_(params).each(function (name, index) {
		name = name.substring(1);

		if (args == null) return;

		if (name in res && _.isArray(res[name])) res[name].push(args[index]);else if (name in res && !_.isArray(res[name])) res[name] = [res[name]].concat(args[index]);else res[name] = args[index];
	});
	return res;
}

function toPromise(arg) {
	var resolve = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

	if (arg instanceof Promise || arg && _.isFunction(arg.then)) return arg;else return resolve ? Promise.resolve(arg) : Promise.reject(arg);
}
function getCallbackFunction(callback, executeResult, asPromise) {
	return function () {
		executeResult.value = callback && callback.apply(undefined, arguments);
		executeResult.promise = toPromise(executeResult.value);
		return executeResult.value;
	};
}

function processCallback(router, actionContext, routeType) {

	var args = router.getOption('classicMode') ? actionContext.rawArgs || [] : [actionContext];

	var asPromise = router.getOption('callbackAsPromises');
	var executeResult = {};
	var callback = getCallbackFunction(actionContext.callback, executeResult, asPromise);

	//console.log('routeType:',routeType);

	router.triggerEvent('before:' + routeType, actionContext);

	var shouldTriggerEvent = router.execute(callback, args);
	if (shouldTriggerEvent !== false) {
		router.triggerEvent(routeType, actionContext);
	}

	executeResult.promise.then(function (arg) {
		router.triggerEvent('after:' + routeType, actionContext);
		return arg;
	}, function () {
		router.triggerEvent('error:' + routeType, actionContext);
	});

	return executeResult.value;
}

// supports passing options to the callback
// by using new version of loadUrl
function historyNavigate(fragment, opts) {

	var options = opts === true ? { trigger: true } : _.isObject(opts) ? _.clone(opts) : {};

	var trigger = options.trigger;

	delete options.trigger;

	history.navigate(fragment, options);

	if (trigger) {
		return historyLoadUrl(fragment, opts);
	}
}

// original loadUrl does not pass options to the callback
// and this one does
function historyLoadUrl(fragment, opts) {
	// If the root doesn't match, no routes can match either.
	if (!history.matchRoot()) return false;
	fragment = history.fragment = history.getFragment(fragment);
	return executeHandler(fragment, opts);
}

//TODO: think about constraints check
function testHandler(handler, fragment) {
	return handler.route.test(fragment);
}

function findHandler(fragment, customTest) {
	var test = _.isFunction(customTest) ? customTest : testHandler;
	fragment = history.getFragment(fragment);
	return _.filter(history.handlers || [], function (handler) {
		return test(handler, fragment);
	})[0];
}

function executeHandler(fragment) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var resultContext = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	var handler = findHandler(fragment, opts.testHandler);
	handler && (resultContext.value = handler.callback(fragment, opts));
	return !!handler;
}

//import triggerMethodOn from '../../mn/trigger-method-on';
var BaseRouter = mix(Router).with(Mixin);
var Router$1 = BaseRouter.extend({

	// for migrating from Mn.AppRoute
	// set to true. it will populate routes from { controller, appRoutes } structure.
	isMarionetteStyle: false,

	// by default Backbone.Router tries to lookup callback in router instance by name `callback = this[name]` if there is no callback provided
	// its recomend to turn this feature to false
	// default value is true for Backbone.Router compatability
	isRouterHoldsActions: true,

	// by default Backbone.Router `route` method returns router itself instead of just created routeContext for chaining purposes.
	// you can change this behavior turning this feature to false
	isRouteChaining: true,

	//in classic mode actions receive argument array
	//if you need actionContext instead turn this option to false
	classicMode: true,

	constructor: function constructor() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


		this.options = _.extend({}, _.result(this, 'options'), options);

		BaseRouter.apply(this, arguments);

		this.on('re:route:last', this._onReRouteLast);
	},


	/*
 
 	initialize methods
 	"when a router initialized"
 
 */

	//by default router expects that routes will result in { route, callback } hash
	//we are extending this to provide more flexibility
	// - overrided
	_bindRoutes: function _bindRoutes() {

		var routes = this.getInitRoutes();
		if (!_.size(routes)) return;
		this.addRoutes(routes);
	},
	getInitRoutes: function getInitRoutes() {
		var routes = void 0;
		if (this.getOption('isMarionetteStyle')) {
			var controller = this.getOption('controller') || {};
			var approutes = this.getOption('appRoutes') || {};
			routes = _(approutes).map(function (name, route) {
				return {
					route: route, name: name,
					callback: controller[name]
				};
			});
		} else {
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
	route: function route(_route, name, callback) {
		var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


		//normalizing passed arguments and putting them into a context object
		//refactored from original route
		// let context = this._normalizeRegisterRouteArguments(route, name, callback, opts);

		// //extends context with result of `mergeWithRegisterRouteContext`
		// this._normalizeRegisterRouteContext(context);

		// //wrapping provided callback 
		// this._normalizeRegisterRouteCallback(context);

		var context = this._buildRouteContext(_route, name, callback, opts);

		//refactored for providing possibility to override
		//at this point context should be almost ready
		this.registerRouteContext(context);

		this._storeCreatedContext(context, opts);

		return opts.isRouteChaining === true ? this : context;
	},


	// provide more semantic alias for route
	addRoute: function addRoute(route, name, callback) {
		var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

		if (opts.isRouteChaining == null) opts.isRouteChaining = this.getOption('isRouteChaining');

		var context = this.route(route, name, callback, opts);
		return context;
	},


	//process many routes at once
	//accepts object { name, routeContext | handler }
	// or array of routeContexts
	addRoutes: function addRoutes(routes) {
		var _this = this;

		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


		if (opts.isRouteChaining == null) opts.isRouteChaining = this.getOption('isRouteChaining');

		var normalized = _(routes).chain().map(function (value, key) {
			return _this._normalizeRoutes(value, key);
		}).filter(function (f) {
			return _.isObject(f);
		}).value();

		if (opts.doNotReverse != true) normalized.reverse();

		var registered = _(normalized).map(function (route) {
			return route && _this.addRoute(route, _.extend({ massAdd: true }, opts));
		});

		if (opts.doNotReverse != true) registered.reverse();

		_(registered).each(function (c) {
			return _this._storeCreatedContext(c);
		});

		return registered;
	},


	// internal method called by `addRoutes` to normalize provided data
	_normalizeRoutes: function _normalizeRoutes(value, key) {
		//let route, name, callback;
		var context = void 0;
		if (_.isString(value)) {
			context = {
				route: key,
				name: value
			};
		} else if (_.isFunction(value)) {
			context = { route: key, callback: value };
		} else if (_.isObject(value)) {
			context = _.clone(value);
			if (!_.has(context, 'route')) context.route = key;else if (_.has(context, 'route') && !_.has(context, 'name')) context.name = key;
		} else {
			return;
		}
		return context;
	},
	_buildRouteContext: function _buildRouteContext(route, name, callback, opts) {

		var context = routeArgumentsToObject(this, route, name, callback, opts);

		return this.buildRouteContext(context);
	},


	//override this method if you need more information in route context
	// should return object wich will be merged with default context
	// be aware of providing reserved properties: route, name, callback
	// this will override context defaults
	buildRouteContext: function buildRouteContext(context) {
		return context;
	},

	//finally, putting handler to the backbone.history.handlers
	registerRouteContext: function registerRouteContext(context) {
		Backbone.history.route(context.route, context.callbackWrapper, context);
	},


	//store registered context for further use
	_storeCreatedContext: function _storeCreatedContext(context) {
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		this.routeContexts || (this.routeContexts = {});
		if (!opts.massAdd) this.routeContexts[context.name] = context;
		return context;
	},


	/*
 
 	process route methods		
 	"when route happens"
 
 */

	//inner route handler
	//preparing actionContext and calls public processCallback
	_processCallback: function _processCallback(routeContext, fragment) {
		var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

		var actionContext = createActionContext(this, routeContext, fragment, options);
		var result = this.processCallback(actionContext, actionContext.routeType, options);
		return result;
	},


	//by default behave as original router
	//override this method to process action by your own
	processCallback: function processCallback$$1(actionContext, routeType) {

		return processCallback(this, actionContext, routeType);
	},


	//just triggers appropriate events
	triggerRouteEvents: function triggerRouteEvents(context, event, name) {
		var _Backbone$history;

		if (event == 'route') {
			this.lastActionContext = context;
		}

		for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
			args[_key - 3] = arguments[_key];
		}

		this.trigger.apply(this, [event + ':' + name].concat(toConsumableArray(args)));
		this.trigger.apply(this, [event, name].concat(toConsumableArray(args)));
		(_Backbone$history = Backbone.history).trigger.apply(_Backbone$history, [event, this, name].concat(toConsumableArray(args)));
	},
	triggerEvent: function triggerEvent(event, context) {
		this.trigger(event, context);
		Backbone.history.trigger(event, context);
	},


	//converts string to object
	//default implementation, can be overriden by user
	queryStringParser: paramsToObject,

	// navigate(...args){
	// 	historyNavigate(...args);
	// 	return this;
	// },

	_routeToRegExp: function _routeToRegExp(route) {

		var optionalParam = /\((.*?)\)/g;
		var namedParam = /(\(\?)?:\w+/g;
		var splatParam = /\*\w+/g;
		var escapeRegExp = /[-{}[]+?.,\\\^$|#\s]/g;

		route = route.replace(escapeRegExp, '\\$&').replace(optionalParam, '(?:$1)?').replace(namedParam, function (match, optional) {
			return optional ? match : '([^/?]+)';
		}).replace(splatParam, '([^?]*?)');
		var flags = this.getOption('routeCaseInsensitive') ? 'i' : '';
		return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$', flags);
	},


	/*
 	Some API methods
 */

	getContextByFragment: function getContextByFragment(fragment) {
		if (!_.isString(fragment)) return;
		//let contexts = this.routeContexts;
		//console.log('Router contexts', contexts);
		var result = _(this.routeContexts).find(function (cntx) {
			return cntx.route.test(fragment);
		});
		return result;
	}
});

var BaseRouter$2 = Router$1.extend({

	classicMode: false,
	isRouterHoldsActions: false,
	isRouteChaining: false,
	callbackAsPromises: true,
	routeCaseInsensitive: true,
	registerPageRoutes: function registerPageRoutes(page) {
		var _this = this;

		var contexts = page.getRoutesContexts();
		_(contexts).each(function (context) {
			var callback = function callback() {
				return page.start.apply(page, arguments);
			};
			_this.addRoute(context.route, context.name, callback);
		});
	}
});

function getModel(arg) {
	return isModel(arg) ? arg : isView(arg) ? arg.model : undefined;
}

function getModel$1(arg) {
	return isView(arg) && arg;
}

function compareAB(a, b, func) {
	if (_.isArray(func)) {

		var result = 0;

		_(func).every(function (f) {
			result = compareAB(a, b, f);
			return result === 0;
		});

		return result;
	} else {
		if (_.isFunction(func)) {
			a = func.call(a, getModel(a), getModel$1(a));
			b = func.call(b, getModel(b), getModel$1(b));
		}
		return a < b ? -1 : a > b ? 1 : 0;
	}
}

function comparator() {
	var result = 0;

	//for simple case (arg1, arg2, compare)

	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	if (args.length <= 3 && !_.isArray(args[0])) {

		return compareAB.apply(null, args);
	}
	//for complex cases ([arg1, arg2, compare], [], .... [])
	//each arguments should be an array
	else {

			_(args).every(function (single) {

				if (!_.isArray(single)) return true;
				result = compareAB.apply(undefined, toConsumableArray(single));
				return result === 0;
			});
		}

	return result;
}

var RoutesMixin = {
	initializeRoutes: function initializeRoutes() {
		if (this.initializeRouter()) {
			this._buildRoutes();
		}
	},
	initializeRouter: function initializeRouter() {
		if (this.getOption('shouldCreateRouter') && !this.router) this.router = this._createRouter();

		return !!this.router;
	},
	_createRouter: function _createRouter() {
		var Router$$1 = this.getOption('Router') || BaseRouter$2;
		var options = _.extend({}, this.getOption('routerOptions'));
		return new Router$$1(options);
	},
	_buildRoutes: function _buildRoutes() {
		this._buildRoutesContexts();
		this.router.registerPageRoutes(this);
	},
	_buildRoutesContexts: function _buildRoutesContexts() {
		var _this = this;

		var routes = this.getOption('routes', { args: [this] });
		if (routes == null) return;
		if (_.isString(routes)) routes = [routes];

		var result = [];
		var config = this.getRoutesConfig();
		_(routes).each(function (route, index) {
			var context = _this._normalizeRoutesContextRoute(route, index, config);
			_.isObject(context) && result.push(context);
		});
		this.routesContext = result;
		return this.routesContext;
	},
	_normalizeRoutesContextRoute: function _normalizeRoutesContextRoute(arg, index) {
		var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

		if (arguments.length < 2) {
			config = this.getRoutesConfig();
		}
		var context = {};
		if (arg == null) return;
		if (_.isString(arg)) {
			_.extend(context, { route: arg, rawRoute: arg });
		} else if (_.isFunction(arg)) {
			arg = arg.call(this, this, index);
			return this._normalizeRoutesContextRoute(arg, index);
		} else {
			_.extend(context, arg);
		}
		var name = _.isString(index) && index || context.name || context.route || _.uniqueId('route');
		context.name = name;

		if (_.isNumber(index) && context.order == null) context.order = index;

		if (!context.rawRoute) context.rawRoute = context.route;

		if (config.relative && config.parentContext) context.route = config.parentContext.route + '/' + context.route;

		return context;
	},
	getRoutesConfig: function getRoutesConfig() {
		var config = _.extend({
			relative: this.getOption('relativeRoutes', { args: [this] }),
			parent: this.parent,
			parentContext: this.parent && _.isFunction(this.parent.getMainRoute) && this.parent.getMainRouteContext()
		}, this.getOption('routesConfig', { args: [this] }));

		return config;
	},
	getRoutesContexts: function getRoutesContexts() {
		return this.routesContext || [];
	},
	getMainRouteContext: function getMainRouteContext() {
		if (this.mainRouteContext) return this.mainRouteContext;

		this.mainRouteContext = this.getRoutesContexts().chain().sortBy(function (a, b) {
			return comparator([[b, a, function (c) {
				return c.main;
			}], [a, b, function (c) {
				return c.order;
			}]]);
		}).take(1).value()[0];
		return this.mainRouteContext;
	}
};

var BasePage = mix(MnObject).with(Mixin, ChildrenableMixin, StartableMixin, RoutesMixin);

var index$9 = BasePage.extend({
	constructor: function constructor() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		BasePage.apply(this, arguments);
		this.mergeOptions(opts, 'root, parent, router');

		//routes-mixin
		this.initializeRoutes();
		//ChildrenableMixin
		this.initializeChildren();
	},
	buildChildOptions: function buildChildOptions(options) {
		return _.extend({
			root: this.root,
			parent: this.parent,
			router: this.router
		}, options);
	}
});

var index$10 = _.extend({
	watch: function watch() {
		this.entries = [];
		this.listenTo(history, 'route', this.onRoute);
		this.listenTo(history, 'backrouteroute', this.onBackRoute);
	},
	onRoute: function onRoute() {
		var _console;

		(_console = console).log.apply(_console, ['watcher:  route > '].concat(Array.prototype.slice.call(arguments)));
	},
	onBackRoute: function onBackRoute() {
		var _console2;

		(_console2 = console).log.apply(_console2, ['watcher: back route > '].concat(Array.prototype.slice.call(arguments)));
	}
}, Events);

function normalizeOptions() {
	var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'route';
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	if (_.isObject(type)) {
		opts = type;
		type = 'route';
	}
	return _.extend({ routeType: type, trigger: true }, opts);
}

function execute(url, opts) {
	return go(url, 'execute', opts);
}
function navigate(url, opts) {
	return go(url, 'route', opts);
}
function navigateBack(url, opts) {
	return go(url, 'backroute', opts);
}

function go(url, type, opts) {
	var options = normalizeOptions(type, opts);
	switch (options.routeType) {
		default:
		case 'route':
		case 'backroute':
			return historyNavigate(url, options);
		case 'execute':
			return executeHandler(url, options);
	}
}

var index$11 = Object.freeze({
	execute: execute,
	navigate: navigate,
	navigateBack: navigateBack,
	go: go
});



var index$12 = Object.freeze({
	historyWatcher: index$10,
	navigator: index$11,
	processEngine: initializeProcess,
	Router: Router$1,
	Page: index$9,
	PageRouter: BaseRouter$2
});

function traverse(fields, root) {
	root = root || '';
	if (this == null || _typeof(this) != 'object') {
		return;
	}

	var hash = isModel(this) ? this.attributes : this;

	var props = Object.getOwnPropertyNames(hash);

	for (var x = 0; x < props.length; x++) {
		var name = props[x];
		var prop = this[name];

		if (prop == null || (typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) != 'object' || prop instanceof Date || prop instanceof Array) {

			fields[root + name] = prop;
		} else if ((typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) == 'object') {

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

function setProperty(context, name, value) {
	if (isModel(context)) {
		context.set(name, value, { silent: true });
	} else {
		context[name] = value;
	}

	return getProperty(context, name);
}

function ensureSetByPathArguments(context, path) {
	var errors = [];
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

	var argumentsErrors = ensureSetByPathArguments(context, propertyName);
	if (argumentsErrors) {
		return;
	}

	var modelContext = void 0;
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

function normalizeSetByPathOptions() {
	var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var ext = arguments[1];


	var options = _.extend({}, opts, ext, {
		silent: opts.silent === true,
		force: opts.force !== false,
		//passPath: [],
		models: []
	});

	return options;
}

function triggerModelEventsOnSetByPath(value) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	if (options.silent || !options.models.length) {
		return;
	}

	_(options.models).each(function (context) {
		var rest = context.pathChunks.join(':');
		if (rest) {
			context.model.trigger('change:' + context.property + ':' + rest, context.model, value);
		}
		context.model.trigger('change:' + context.property, context.model, value);
		context.model.trigger('change', context.model);
	});

	// //triggering change event on all met models
	// let originPath = options.pathArray.join(':');
	// while (options.models.length) {
	// 	let modelContext = options.models.pop();
	// 	let propertyEventName = modelContext.path == ''
	// 		? originPath
	// 		: originPath.substring(modelContext.path.length + 1);

	// 	if (propertyEventName) {
	// 		modelContext.model.trigger('change:' + propertyEventName, value);
	// 	}
	// 	modelContext.model.trigger('change', modelContext.model);
	// }
}

function setByPath(context, path, value) {
	var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


	var argumentsErrors = ensureSetByPathArguments(context, path);
	if (argumentsErrors) {
		return value;
	}

	var pathArray = path.split('.');
	var options = normalizeSetByPathOptions(opts, { path: path, pathArray: [].slice.call(pathArray) });

	var propertyName = pathArray.shift();

	var result = setByPathArr(context, propertyName, pathArray, value, options);

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



var index$13 = Object.freeze({
	betterResult: betterResult,
	camelCase: camelCase,
	comparator: comparator,
	compareAB: compareAB,
	convertString: convertString,
	extend: extend,
	flat: flattenObject,
	getByPath: getByPath,
	isKnownCtor: isKnownCtor,
	mix: mix,
	paramsToObject: paramsToObject,
	setByPath: setByPath,
	unflat: unFlat
});

export { index$8 as mixins, index$13 as utils, index$12 as components };

//# sourceMappingURL=index.js.map
