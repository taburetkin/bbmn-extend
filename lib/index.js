(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('index', factory) :
	(global.index = factory());
}(this, (function () { 'use strict';

	// import { Model } from 'backbone';
	// export default Model;
	var Model = Backbone.Model;

	//import { Collection } from 'backbone';
	//export default Collection;

	var Collection = Backbone.Collection;

	// import { View } from 'backbone';
	// export default View;
	var View = Backbone.View;

	// import { Router } from 'backbone';
	// export default Router;
	var Router = Backbone.Router;

	//import Mn from 'backbone.marionette';
	var MnObject = Mn.Object;

	var knownCtors = [Model, Collection, View, Router, MnObject];

	function isKnownCtor(arg) {
		var isFn = _.isFunction(arg);
		var result = _(knownCtors).some(function (ctor) {
			return arg === ctor || arg.prototype instanceof ctor;
		});
		return isFn && result;
	}

	function getProperty(valueContext, key) {
		var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
		var fallback = arguments[3];


		var context = options.context || valueContext;
		options.deep !== undefined || (options.deep = true);
		options.force !== undefined || (options.force = true);
		options.args || (options.args = []);

		//key and valueContext should be passed
		if (key == null) return;

		//getting raw value
		var value = valueContext && valueContext[key];

		//if there is no raw value and deep option is true then getting value from fallback
		if (value === undefined && options.deep && _.isFunction(fallback)) {
			var fallbackOptions = _.extend({}, options, { deep: false, force: false });
			value = fallback.call(context, key, fallbackOptions);
		}

		//if returned value is function and is not any of known constructors and options property force set to true 
		//we should return value of that function
		//options.args will be passed as arguments
		if (_.isFunction(value) && options.force && !isKnownCtor(value)) value = value.apply(context, options.args || []);

		//console.log('key', key, value);

		//if value is still undefined we will return default option value
		return value === undefined ? options.default : value;
	}

	var getOption = (function (Base) {
		return Base.extend({
			//property first approach
			getProperty: function getProperty$$1(key) {
				var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

				return getProperty(this, key, options, this.getOption);
			},

			//options first approach
			getOption: function getOption(key) {
				var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

				options.context = this;
				return getProperty(this.getProperty('options', { deep: false }), key, options, this.getProperty);
			}
		});
	});

	var common = {
		getOption: getOption
	};

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

	function getProperty$1(context, name) {
		if (context == null || !_.isObject(context) || name == null || name == '') return;
		if (isModel(context)) return context.get(name, { gettingByPath: true });else return context[name];
	}

	function getByPathArray(context, propertyName, pathArray) {

		if (context == null || !_.isObject(context) || propertyName == null || propertyName == '') return;

		var prop = getProperty$1(context, propertyName);

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

	var smartGet = (function (Base) {
		var originalGet = Model.prototype.get;
		var Mixed = Base.extend({
			getByPath: function getByPath$$1(key) {
				if (key.indexOf('.') > -1) return getByPath(this, key);else return originalGet.call(this, key);
			},
			get: function get(key) {
				var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

				if (key == null) return;

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

	var model = {
		smartGet: smartGet
	};

	var defaultCssConfig = {
		beforeRender: true,
		modelChange: true,
		refresh: true
	};

	var cssClassModifiers = (function (Base) {
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

	var view = {
		cssClassModifiers: cssClassModifiers
	};

	var mixins = {
		common: common, model: model, view: view
	};

	function isView(arg) {
		return arg instanceof View;
	}

	function getModel(arg) {
		return isModel(arg) ? arg : isView(arg) ? arg.model : undefined;
	}

	function getModel$1(arg) {
		return isView(arg) && arg;
	}

	function compareAB(a, b, func) {
		if (_.isFunction(func)) {

			a = func.call(a, getModel(a), getModel$1(a));
			b = func.call(b, getModel(b), getModel$1(b));

			return a < b ? -1 : a > b ? 1 : 0;
		} else if (_.isArray(func)) {

			var result = 0;

			_(func).every(function (f) {
				if (!_.isFunction(f)) return true;
				result = compareAB(a, b, f);
				return result === 0;
			});

			return result;
		}
	}

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

	function comparator() {
		var result = 0;

		//for simple case (arg1, arg2, compare)

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		if (args.length === 3 && !_.isArray(args[0])) {

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

	//import Mn from 'backbone.marionette';
	var extend = Mn.extend;

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

	var defaultOptions = {
	    mergeObjects: true,
	    wrapObjectWithConstructor: true
	};

	function normalizeArguments(args) {
	    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    var raw = {};
	    var wrap = opts.wrapObjectWithConstructor == true;
	    var merge = opts.mergeObjects == true;
	    var ctors = [];
	    _(args).each(function (arg) {
	        if (_.isFunction(arg)) {
	            ctors.push(arg);
	            return;
	        }

	        if (!_.isObject(arg)) return;

	        if (!merge || wrap && _.isFunction(arg.constructor)) {
	            ctors.push(function (Base) {
	                return Base.extend(arg);
	            });
	        } else {
	            _.extend(raw, arg);
	        }
	    });

	    if (_.size(raw)) ctors.unshift(function (Base) {
	        return Base.extend(raw);
	    });

	    return ctors;
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

	function mix(_ctor, options) {

	    var opts = _.extend({}, defaultOptions, options);

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

	function setProperty(context, name, value, options) {
		if (isModel(context)) {
			context.set(name, value, { silent: true });
		} else {
			context[name] = value;
		}

		if (isModel(value)) {
			options.models.push({
				path: options.passPath.join(':'),
				property: name,
				model: value
			});
		}

		options.passPath.push(name);

		return getProperty$1(context, name);
	}

	function setByPathArr(context, propertyName, pathArray, value, options) {

		if (context == null || !_.isObject(context) || propertyName == null || propertyName == '') {
			return;
		}

		if (!pathArray.length) {
			return setProperty(context, propertyName, value, options);
		}

		var prop = getProperty$1(context, propertyName);

		if (!_.isObject(prop) && !options.force) {
			return;
		} else if (!_.isObject(prop) && options.force) {
			prop = setProperty(context, propertyName, {}, options);
		}

		var nextName = pathArray.shift();

		return setByPathArr(prop, nextName, pathArray, value, options);
	}

	function setByPath(context, path, value, opts) {

		if (context == null || !_.isObject(context) || path == null || path == '') return;

		var options = _.extend({}, opts);
		options.silent = options.silent === true;
		options.force = options.force !== false;

		if (_.isObject(path) && !_.isArray(path)) {
			value = path.value;
			options.force = path.force !== false;
			options.silent = path.silent === true;
			path = path.path;
		}

		options.path = path;
		options.passPath = [];
		options.models = [];

		if (path == null || path == '') return;

		var pathArray = _.isString(path) ? path.split('.') : _.isArray(path) ? [].slice.call(path) : [path];

		options.pathArray = [].slice.call(pathArray);

		if (!pathArray.length) return;

		var prop = pathArray.shift();

		if (isModel(context)) {
			options.models.push({
				path: '',
				property: prop,
				model: context
			});
		}

		var result = setByPathArr(context, prop, pathArray, value, options);

		if (result === undefined && value !== undefined) return result;

		//triggering change event on all met models
		if (!options.silent) {
			var originPath = options.pathArray.join(':');
			while (options.models.length) {
				var modelContext = options.models.pop();
				var propertyEventName = modelContext.path == '' ? originPath : originPath.substring(modelContext.path.length + 1);

				if (propertyEventName) {
					modelContext.model.trigger('change:' + propertyEventName, value);
				}
				modelContext.model.trigger('change', modelContext.model);
			}
		}

		return result;
	}

	function unFlat(obj) {

		if (obj == null || !_.isObject(obj)) return;
		var res = {};
		for (var e in obj) {
			setByPath(res, e, obj[e], true);
		}
		return res;
	}

	var utils = {
		comparator: comparator, compareAB: compareAB, extend: extend,
		flat: flattenObject, getByPath: getByPath, getProperty: getProperty, isKnownCtor: isKnownCtor,
		mix: mix, setByPath: setByPath, unflat: unFlat
	};

	var index = {
		mixins: mixins, utils: utils
	};

	return index;

})));

//# sourceMappingURL=index.js.map
