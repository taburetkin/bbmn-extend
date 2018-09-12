var bbmn = (function (exports,Backbone$1,Mn) {
'use strict';

var Backbone$1__default = 'default' in Backbone$1 ? Backbone$1['default'] : Backbone$1;
var Mn__default = 'default' in Mn ? Mn['default'] : Mn;

var MnObject = Mn__default.Object || Mn__default.MnObject;

var ctors = [Backbone$1.Model, Backbone$1.Collection, Backbone$1.View, Backbone$1.Router, MnObject];

var tryGetFromMn = ['Region', 'Application', 'AppRouter'];

_.each(tryGetFromMn, function (ClassName) {
	_.isFunction(Mn__default[ClassName]) && ctors.push(Mn__default[ClassName]);
});

function isKnownCtor(arg) {
	var isFn = _.isFunction(arg);
	var result = _(ctors).some(function (ctor) {
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

// camelCase('asd:qwe:zxc') -> asdQweZxc
// camelCase('asd:qwe:zxc', true) -> AsdQweZxc
function camelCase(text, first) {
	if (!_.isString(text)) return text;
	var splitter = first === true ? /(^|:)(\w)/gi : /(:)(\w)/gi;
	text = text.replace(splitter, function (match, prefix, text) {
		return text.toUpperCase();
	});
	if (!first) text = text.replace(/(^)(\w)/gi, function (match, prefix, text) {
		return text.toLowerCase();
	});
	return text;
}

function isClass(arg, Base) {
	return _.isFunction(arg) && (arg == Base || arg.prototype instanceof Base);
}

function isModel(arg) {
	return arg instanceof Backbone$1.Model;
}
function isModelClass(arg) {
	return isClass(arg, Backbone$1.Model);
}

function isCollection(arg) {
	return arg instanceof Backbone$1.Collection;
}
function isCollectionClass(arg) {
	return isClass(arg, Backbone$1.Collection);
}

function isView(arg) {
	return arg instanceof Backbone$1.View;
}

function isViewClass(arg) {
	return isClass(arg, Backbone$1.View);
}

var extend = Backbone$1.Model.extend;

function getModel(arg) {

	if (isModel(arg)) {
		return arg;
	}

	if (isView(arg)) {
		return arg.model;
	}
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

		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	}
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};



















var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};





















var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













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

function getOption() {
	var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var key = arguments[1];
	var opts = arguments[2];
	var also = arguments[3];


	if (_.isObject(key) && _.isString(opts)) {
		var _opts = also;
		also = key;
		key = opts;
		opts = _opts;
	}

	var options = _.extend({ args: [context], context: context }, opts, { default: null });
	var deep = options.deep;

	var defaultValue = opts && opts.default;

	var value = betterResult(context.options || also, key, options);
	if (value == null && deep !== false) {
		value = betterResult(context, key, options);
	}

	return value != null ? value : defaultValue;
}

function instanceGetOption() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	return getOption.apply(undefined, [this].concat(args));
}

function transformStringArray(arr) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var _opts$ignoreCase = opts.ignoreCase,
	    ignoreCase = _opts$ignoreCase === undefined ? true : _opts$ignoreCase,
	    _opts$toCamelCase = opts.toCamelCase,
	    toCamelCase = _opts$toCamelCase === undefined ? false : _opts$toCamelCase;

	return _(arr).map(function (value) {
		if (ignoreCase) return value.toLowerCase();else if (toCamelCase) return camelCase(value);else return value;
	});
}
function hasFlag(value, flag) {
	var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	if (value == null || flag == null) return false;
	if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) != (typeof flag === 'undefined' ? 'undefined' : _typeof(flag))) throw new Error('value and flag must be of same type. allowed types: string, number');

	if (_.isNumber(value) && _.isNumber(flag)) {
		var has = value & flag;
		return opts.all === true ? has === flag : has > 0;
	}

	if (_.isString(value) && _.isString(flag)) {
		if (value === '' || flag === '') return false;
		var values = transformStringArray(value.split(/\s*,\s*/), opts);
		var flags = transformStringArray(flag.split(/\s*,\s*/), opts);
		var intersection = _.intersection(values, flags);

		if (intersection.length == 0) return false;

		if (intersection.length == flags.length) return true;

		return opts.all != true;
	}
}

var defaultOptions$1 = {
	mergeObjects: true,
	wrapObjectWithConstructor: true
};

function createMixinFromObject(arg) {
	var mixedObj = _.clone(arg);
	var mixedCtor = _.isFunction(mixedObj.constructor) && mixedObj.constructor;
	return function (Base) {
		if (_.isFunction(mixedCtor)) {
			//let providedCtor = ((mixed) => mixed)(obj.constructor);
			mixedObj.constructor = function mx() {
				Base.apply(this, arguments);
				mixedCtor.apply(this, arguments);
			};
		}
		return Base.extend(mixedObj);
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
		var mixed = Ctor(Memo);
		return mixed;
	}, Mixed);
}

function mix(_ctor, options) {

	var opts = _.extend({}, defaultOptions$1, options);

	var ctor = void 0;

	if (_.isFunction(_ctor)) {
		ctor = _ctor;
	} else if (_.isObject(_ctor)) {
		var b = _.isFunction(_ctor.constructor) && _ctor.constructor;
		ctor = function mx() {
			b.apply(this, arguments);
		};
		_.extend(ctor.prototype, _.omit(_ctor, 'constructor'));
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

function compareObjects(objectA, objectB) {

	if (!_.isObject(objectA) || !_.isObject(objectB)) {
		return objectA == objectB;
	}
	if (_.isArray(objectA) && !_.isArray(objectB) || _.isArray(objectB) && !_.isArray(objectA)) {
		return false;
	}

	if ((typeof objectA === "undefined" ? "undefined" : _typeof(objectA)) != (typeof objectB === "undefined" ? "undefined" : _typeof(objectB))) return false;

	var size = _.size(objectA);
	if (size != _.size(objectB)) return false;

	if (_.isArray(objectA)) {
		var allvalues = _.uniq(objectA.concat(objectB));
		return _.every(allvalues, function (value) {
			var valuesA = _.filter(objectA, function (_v) {
				return _v == value;
			});
			var valuesB = _.filter(objectB, function (_v) {
				return _v == value;
			});
			if (valuesA.length != valuesB.length) return false;
			return compareObjects(valuesA[0], valuesB[0]);
		});
	} else {
		var allkeys = _.uniq(_.keys(objectA).concat(_.keys(objectB)));
		if (allkeys.length != size) return false;
		return _.every(allkeys, function (key) {
			return compareObjects(objectA[key], objectB[key]);
		});
	}
}

function mergeObject(src, dst) {
	if (!_.isObject(src) || !_.isObject(dst)) {
		return dst;
	}
	var flatSrc = flattenObject(src);
	var flatDst = flattenObject(dst);
	_.each(flatDst, function (value, key) {
		flatSrc[key] = value;
	});
	return unFlat(flatSrc);
}

function triggerMethod(event) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	// get the method name from the event name
	var methodName = camelCase('on:' + event);
	var method = getOption(this, methodName, { force: false });
	var result = void 0;

	// call the onMethodName if it exists
	if (_.isFunction(method)) {
		// pass all args, except the event name
		result = method.apply(this, args);
	}

	if (_.isFunction(this.trigger)) {
		// trigger the event
		this.trigger.apply(this, arguments);
	}

	return result;
}

function triggerMethodOn(context, event) {
	for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
		args[_key2 - 2] = arguments[_key2];
	}

	return triggerMethod.call.apply(triggerMethod, [context, event].concat(args));
}

function mergeOptions(options, keys) {
	var _this = this;

	if (!options) {
		return;
	}

	_.each(keys, function (key) {
		var option = options[key];
		if (option !== undefined) {
			_this[key] = option;
		}
	});
}

function register (Process, context, name, opts) {

	context[name] = function () {

		var process = new Process(context, name, _.extend({}, opts));
		var concurrent = process.concurrencyCheck();

		if (concurrent) return concurrent;else return process.run.apply(process, arguments);
	};
}

function isPromisable(arg) {
	return arg instanceof Promise || _.isFunction(arg && arg.then);
}

function asArray(arg) {
	if (_.isArray(arg)) return arg;else if (arg == null || arg === '') return [];else return [arg];
}

function race() {
	for (var _len = arguments.length, promises = Array(_len), _key = 0; _key < _len; _key++) {
		promises[_key] = arguments[_key];
	}

	return Promise.race(promises);
}

function valueToPromise(arg) {
	if (!isPromisable(arg)) {
		var result = arg;
		arg = arg == null || arg === '' ? Promise.resolve() : Promise.reject(result);
	}
	return arg;
}

var Process = mix({
	constructor: function Process(context, name, opts) {
		this._initDefaults(name, context);
		this._initCancelation();
		this._mergeOptions(opts);
	},

	// initialize methods

	_initDefaults: function _initDefaults(name, context) {
		if (name == null || name === '') throw new Error('Process requires two arguments: name [string], context [object]. name missing');

		if (!_.isObject(context)) throw new Error('Process requires two arguments: name [string], context [object]. context is not an object');

		this.cid = _.uniqueId('process');
		this.name = name;
		this.context = context;
		this.errors = [];
	},
	_initCancelation: function _initCancelation() {
		var _this = this;

		this.cancelPromise = new Promise(function (resolve, reject) {
			_this.cancel = function () {
				return reject('cancel');
			};
		});
	},
	_mergeOptions: function _mergeOptions() {
		var _this2 = this;

		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		var options = _.omit(opts, 'cid', 'name', 'context', 'cancelPromise', 'cancel', 'errors');
		_(options).each(function (value, key) {
			return _this2[key] = value;
		});
	},
	concurrencyCheck: function concurrencyCheck() {

		var previous = this.getProcessFromContext();
		//console.log(previous, this.context);
		if (!previous) return;

		var concurrent = this.concurrent;

		if (concurrent === false) {

			this.cancel();
		} else if (concurrent == 'first') {

			return previous.promise;
		} else if (concurrent == 'last') {

			previous.cancel();
		}
	},


	// life cycle methods	

	run: function run() {
		this.updateProcessInContext(this);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		this.args = args || [];
		this.promise = this._createLifeCyclePromise();
		return this.promise;
	},
	_createLifeCyclePromise: function _createLifeCyclePromise() {
		var _this3 = this;

		return this._notCanceled().then(function () {
			return _this3._begin();
		}).then(function () {
			return _this3._beforeStart();
		}).then(function () {
			return _this3._canBeStarted();
		}).then(function () {
			return _this3._waitOtherPromises();
		}).then(function () {
			_this3.triggerComplete();
			return Promise.resolve();
		}).catch(function (error) {
			_this3.triggerError(error);
			var jsError = void 0;
			if (error instanceof Error) {
				throw error;
			} else if (jsError = _this3.getJsError()) {
				throw jsError;
			} else {
				return Promise.reject(_this3);
			}
		});
	},
	_notCanceled: function _notCanceled() {
		return this._cancelationRace(Promise.resolve());
	},
	_begin: function _begin() {
		return this._getHookResultAsPromise('begin');
	},
	_beforeStart: function _beforeStart() {
		return this._getHookResultAsPromise('before');
	},
	_canBeStarted: function _canBeStarted() {
		var contextMethod = 'can:not:' + this.name;
		var promise = this.invokeOnContext(contextMethod);
		if (!isPromisable(promise)) {
			promise = promise == null || promise === '' ? Promise.resolve() : Promise.reject(promise);
		}
		return this._cancelationRace(promise);
	},
	_waitOtherPromises: function _waitOtherPromises() {
		var contextMethod = 'get:' + this.name + ':promises';

		var promises = asArray(this.invokeOnContext(contextMethod));

		return this._cancelationRace(Promise.all(promises));
	},
	_getHookResultAsPromise: function _getHookResultAsPromise(hookName) {
		var _this4 = this;

		var procMethod = camelCase('on:' + hookName);
		var procHook = _.isFunction(this[procMethod]) && this[procMethod].apply(this, [this.context].concat(toConsumableArray(this.args))) || undefined;
		var result = valueToPromise(procHook).then(function () {
			var cntxHook = _this4.triggerOnContext(hookName);
			return valueToPromise(cntxHook);
		});

		return this._cancelationRace(result);
	},


	// trigger methods

	triggerComplete: function triggerComplete() {

		this.updateProcessInContext(null);

		if (_.isFunction(this.onComplete)) this.onComplete.apply(this, [this.context].concat(toConsumableArray(this.args)));

		this.triggerOnContext();

		this.triggerEnd();
	},
	triggerError: function triggerError(errors) {
		var _errors;

		this.updateProcessInContext(null);

		if (!_.isArray(errors)) errors = [errors];

		(_errors = this.errors).push.apply(_errors, toConsumableArray(errors));

		if (_.isFunction(this.onError)) this.onError.apply(this, [this.context].concat(toConsumableArray(this.errors)));

		this.triggerOnContext.apply(this, ['error'].concat(toConsumableArray(this.errors)));

		this.triggerEnd();
	},
	triggerEnd: function triggerEnd() {
		this.triggerOnContext('end');
	},


	// helpers methods

	getJsError: function getJsError(context) {
		!context && (context = this);
		if (context != this && (!_.isObject(context) || !_.isArray(context.errors))) return;

		return _(context.errors).filter(function (f) {
			return f instanceof Error;
		})[0];
	},
	_cancelationRace: function _cancelationRace(promise) {
		return race(this.cancelPromise, promise);
	},
	getContextProcessKey: function getContextProcessKey() {
		return camelCase('_process:' + this.name + ':executing');
	},
	getProcessFromContext: function getProcessFromContext() {
		var key = this.getContextProcessKey();
		return this.context[key];
	},
	updateProcessInContext: function updateProcessInContext(process) {
		var key = this.getContextProcessKey();
		this.context[key] = process;
	},
	triggerOnContext: function triggerOnContext(eventName) {

		var context = this.context;
		if (!_.isFunction(context.trigger)) return;

		var event = (eventName ? eventName + ':' : '') + this.name;

		return triggerMethodOn.apply(undefined, [context, event, this].concat(toConsumableArray(this.args)));
	},
	invokeOnContext: function invokeOnContext(methodName) {
		var method = camelCase(methodName);
		var context = this.context;
		var args = this.args;
		return betterResult(context, method, { args: args });
	}
}).class;

Process.register = function (context, name, opts) {
	return register(this, context, name, opts);
};

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

	if (arg instanceof Promise || arg && _.isFunction(arg.then)) return arg;else if (arg instanceof Error) return Promise.reject(arg);else return resolve ? Promise.resolve(arg) : Promise.reject(arg);
}
function getCallbackFunction(callback, executeResult) {
	return function () {
		try {
			executeResult.value = callback && callback.apply(undefined, arguments);
		} catch (exception) {
			executeResult.value = exception;
		}
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
		if (routeType == 'route' || routeType == 'backroute') router.lastAttempt = actionContext;
	}

	executeResult.promise.then(function (arg) {
		router.triggerEvent('after:' + routeType, actionContext);
		return arg;
	}, function (error) {
		router.triggerEvent('error:' + routeType, error, actionContext);
		router.handleError(error, actionContext);
	});

	return executeResult.value;
}

var errorHandler = {
	handlers: {
		'js:error': function jsError(error) {
			throw error;
		}
	},
	handle: function handle(error, context, args) {
		var _this = this;

		var handlers = this._getHandleContext(error, context, args) || {};
		return _(handlers).some(function (options, key) {
			return _this.applyHandler(key, options);
		});
	},
	applyHandler: function applyHandler(key) {
		var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


		var handler = this.getHandler(key, options);
		if (!handler) return;
		var context = options.context,
		    args = options.args;

		return handler.apply(context, args);
	},
	getHandler: function getHandler(key) {
		if (_.isFunction(this.handlers[key])) return this.handlers[key];
	},
	setHandler: function setHandler(key, handler) {
		if (!_.isString(key) || key === '') throw new Error('setHandler first argument must be a non empty string');

		if (!_.isFunction(handler)) {
			delete this.handlers[key];
		} else {
			this.handlers[key] = handler;
		}
	},
	setHandlers: function setHandlers(hash) {
		var _this2 = this;

		var nullable = hash === null;
		var items = nullable && this.handlers || hash;
		if (!_.isObject(items)) return;
		_(items).each(function (handler, key) {
			return _this2.setHandler(key, nullable || handler);
		});
	},


	// should return hash: { 'handler_key': { context: handler_context, args: handler_arguments}}
	_getHandleContext: function _getHandleContext(error, context) {
		var _this3 = this;

		var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];


		if (_.isArray(error)) {
			return _(error).reduce(function (memo, item) {
				return _.extend(memo, _this3._getHandleContext(item, context, args));
			}, {});
		}

		if (_.isFunction(this.getHandleContext)) {
			var custom = this.getHandleContext(error, context, args);
			if (custom != null) return custom;
		}

		if (error instanceof Error) {
			args.unshift(error);
			return { 'js:error': { context: context, args: args } };
		} else if (_.isString(error)) {
			return defineProperty({}, error, { context: context, args: args });
		} else if (error instanceof $.Deferred().constructor) {
			args.unshift(error);
			return { 'jq:xhr': { context: context, args: args } };
		}
	},


	// provide your own arguments processor
	// should return hash: { 'handler_key': { context: handler_context, args: handler_arguments}}
	getHandleContext: undefined

};

var BaseRouter = mix(Backbone$1.Router).with(Mixin);
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

		//this.on('re:route:last', this._onReRouteLast);
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
		actionContext.restart = function () {
			return actionContext.callbackWrapper(fragment, options);
		};
		var result = this.processCallback(actionContext, actionContext.routeType, options);
		return result;
	},


	//by default behave as original router
	//override this method to process action by your own
	processCallback: function processCallback$$1(actionContext, routeType) {

		return processCallback(this, actionContext, routeType);
	},
	handleError: function handleError(error, action) {
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

		var contexts = page.getRoutesContexts({ reverse: true });
		_(contexts).each(function (context) {
			var callback = function callback() {
				for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
					args[_key] = arguments[_key];
				}

				return _this.startPage.apply(_this, [page].concat(args));
			};
			_this.addRoute(context.route, context.name, callback);
		});
	},
	handleError: function handleError(process, action) {
		var args = void 0,
		    error = void 0;

		if (process instanceof Process) {
			args = [].slice.call(process.errors);
			error = args.shift();
			args.push(action);
		} else {
			error = process;
			args = [action];
		}

		errorHandler.handle(error, this, args);

		//BaseRouter.prototype.handleError(error, action);
	},
	startPage: function startPage(page) {
		var _this2 = this;

		for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
			args[_key2 - 1] = arguments[_key2];
		}

		console.log('startable:', StartableMixin);
		return this.beforePageStart(page).then(function () {
			return page.start.apply(page, toConsumableArray(args));
		}).then(function () {
			return _this2.afterPageStart.apply(_this2, [page].concat(toConsumableArray(args)));
		});
	},
	beforePageStart: function beforePageStart() {
		if (this.previousPage && this.previousPage.isStarted()) return this.previousPage.stop();else return Promise.resolve();
	},
	afterPageStart: function afterPageStart(page) {
		this.previousPage = page;
	},
	restartLastAttempt: function restartLastAttempt() {
		if (this.lastAttempt) return this.lastAttempt.restart();
	}
});

//'../../../components/process/index.js';


var defaultStartableOptions = {
	concurrent: false,

	//good place to supply own state collecting logic
	storeState: function storeState() {

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
	restoreState: function restoreState() {
		var _this = this;

		_(this.contextState || []).each(function (keyValue) {
			_this.context[keyValue.key] = keyValue.value;
		});
	},
	onBefore: function onBefore() {
		this.storeState();
		this.ensureState();
		this.context['startable.status'] = this.processingName;

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		this.context['startable.start.lastArguments'] = args;
	},
	onComplete: function onComplete() {
		this.context['startable.status'] = this.processedName;
	},
	onError: function onError() {
		this.restoreState();
	},
	ensureState: function ensureState() {
		var shouldThrow = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

		var other = this.name == 'start' ? 'stop' : 'start';
		var error = this.name == 'start' ? 'not:stopped' : 'not:started';
		var status = this.context['startable.status'];
		switch (status) {
			case 'stopping':
			case 'starting':
				if (shouldThrow) throw new Error('not:iddle');else return 'not:iddle';
			case 'iddle':
				if (this.name == 'start') return;else if (shouldThrow) throw new Error(error);else return error;
			case other:
				if (shouldThrow) throw new Error(error);else return error;
		}
	}
};

var defaultStartOptions = {
	processingName: 'starting',
	processedName: 'started'
};
var defaultStopOptions = {
	processingName: 'stopping',
	processedName: 'stopped'
};

var StartableMixin = (function (Base) {
	return Base.extend({
		constructor: function constructor() {

			Base.apply(this, arguments);
			this._initializeStartable();
		},

		'startable.status': 'iddle',
		_initializeStartable: function _initializeStartable() {

			var startable = _.extend({}, defaultStartableOptions, this.getOption('startableOptions', { args: [this] }));

			var start = _.extend({}, startable, defaultStartOptions, this.getOption('startOptions', { args: [this] }));
			var stop = _.extend({}, startable, defaultStopOptions, this.getOption('stopOptions', { args: [this] }));

			Process.register(this, 'start', start);
			Process.register(this, 'stop', stop);
		},
		isStarted: function isStarted() {
			return this['startable.status'] === 'started';
		},
		isStopped: function isStopped() {
			return this['startable.status'] === 'stopped' || this['startable.status'] === 'iddle';
		},
		isNotIddle: function isNotIddle() {
			return this['startable.status'] === 'stopping' || this['startable.status'] === 'starting';
		},
		restart: function restart() {
			var _this2 = this;

			if (this.isNotIddle()) throw new Error('Restart not allowed while startable instance is not iddle: ', this['startable.status']);
			var stop = this.isStarted() ? this.stop() : Promise.resolve();
			var args = this['startable.start.lastArguments'] || [];
			return stop.then(function () {
				return _this2.start.apply(_this2, toConsumableArray(args));
			});
		}
	}, {
		StartableMixin: true
	});
});

//import isKnownCtor from '../../../utils/is-known-ctor';
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

			//if (!isKnownCtor(arg)) return;

			_.extend(options, this.getOption('childOptions'), { parent: this });
			options = this.buildChildOptions(options);

			var child = this.buildChild(Child, options);
			this._children.push(child);
		},
		buildChildOptions: function buildChildOptions(options) {
			return options;
		},
		buildChild: function buildChild(Child, options) {
			!Child && (Child = this.getOption('defaultChildClass') || this.prototype.constructor);
			return new Child(options);
		},
		_getChildren: function _getChildren(items) {
			var _this2 = this;

			var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			var exclude = opts.exclude,
			    filter = opts.filter,
			    map = opts.map;


			if (exclude != null && !_.isArray(exclude)) opts.exclude = [exclude];

			if (!_.isFunction(filter)) delete opts.filter;

			var result = [];
			_(items).each(function (item, index) {

				if (!_this2._childFilter(item, index, opts)) return;

				if (_.isFunction(map)) item = map(item);

				item && result.push(item);
			});
			return result;
		},
		_childFilter: function _childFilter(item, index) {
			var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


			if (opts.force) return item;

			var exclude = opts.exclude,
			    filter = opts.filter;


			if (_.isFunction(this.childFilter) && !this.childFilter(item, index, opts)) return;

			if (_.isArray(exclude) && exclude.indexOf(item) >= 0) return;

			if (_.isFunction(filter) && !filter.call(this, item, index, opts)) return;

			return item;
		},

		childFilter: false,
		getChildren: function getChildren() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			var children = [].slice.call(this._children || []);
			opts.reverse && children.length > 1 && children.reverse();
			return this._getChildren(children, opts);
		},
		getAllChildren: function getAllChildren() {
			var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
			var includeSelf = opts.includeSelf,
			    map = opts.map,
			    reverse = opts.reverse;

			var options = _.omit(opts, 'includeSelf', 'map');

			var children = this.getChildren(options);
			var result = _(children).chain().map(function (child) {
				var children = child.getAllChildren(options);
				return reverse ? [children, child] : [child, children];
			}).flatten().value();

			if (includeSelf) {
				var method = reverse ? 'push' : 'unshift';
				result[method](this);
			}

			if (_.isFunction(map)) {
				return _(result).chain().map(map).filter(function (f) {
					return !!f;
				}).value();
			} else {
				return result;
			}
		},
		getParent: function getParent() {
			return this.parent;
		}
	}, { ChildrenableMixin: true });
});

var RoutesMixin = {
	initializeRoutes: function initializeRoutes() {
		if (this.initializeRouter()) {
			this._buildRoutesContexts();
		}
	},
	initializeRouter: function initializeRouter() {
		if (this.getOption('shouldCreateRouter') && !this.router) {
			this.router = this._createRouter();
			this._shouldRegisterAllRoutes = true;
		}

		return !!this.router;
	},
	_createRouter: function _createRouter() {
		var Router$$1 = this.getOption('Router') || BaseRouter$2;
		var options = _.extend({}, this.getOption('routerOptions'));
		return new Router$$1(options);
	},
	registerAllRoutes: function registerAllRoutes() {
		if (!this._shouldRegisterAllRoutes) return;

		var pages = this.getAllChildren({ reverse: true, includeSelf: true, force: true });

		var router = this.router;
		_(pages).each(function (page) {
			return router.registerPageRoutes(page);
		});
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
		var context = { page: this };
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

		if (config.relative && config.parentContext && config.parentContext.route) context.route = config.parentContext.route + '/' + context.route;

		return context;
	},
	getRoutesConfig: function getRoutesConfig() {
		var config = _.extend({
			relative: this.getOption('relativeRoutes', { args: [this] }),
			parent: this.parent,
			parentContext: this.parent && _.isFunction(this.parent.getMainRouteContext) && this.parent.getMainRouteContext()
		}, this.getOption('routesConfig', { args: [this] }));

		return config;
	},
	getRoutesContexts: function getRoutesContexts() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
		var clone = opts.clone,
		    reverse = opts.reverse;

		var result = this.routesContext || [];
		if (clone || reverse) result = [].slice.call(result);
		if (reverse) result.reverse();
		return result;
	},
	getMainRouteContext: function getMainRouteContext() {

		if (this.mainRouteContext) return this.mainRouteContext;
		this.mainRouteContext = _(this.getRoutesContexts()).chain().sortBy(function (a, b) {
			return comparator([[b, a, function (c) {
				return c.main;
			}], [a, b, function (c) {
				return c.order;
			}]]);
		}).take(1).value()[0];

		return this.mainRouteContext;
	}
};

//import StartableMixin from '../../../mixins/common/startable';
// import { 
// 	getOption as GetOptionMixin, 
// 	startable as StartableMixin, 
// 	childrenable as ChildrenableMixin 
// } from '../../../mixins/common/index.js';

var BasePage = mix(MnObject).with(Mixin, ChildrenableMixin, StartableMixin, RoutesMixin);

var index = BasePage.extend({
	constructor: function constructor() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		BasePage.apply(this, arguments);

		this.mergeOptions(opts, ['root', 'parent', 'router', 'canNotStart', 'onStart', 'onBeginStart', 'onBeforeStart', 'onEndStart', 'onStop', 'onBeginStop', 'onBeforeStop', 'onEndStop']);

		// resides in routes-mixin
		this.initializeRoutes();

		// resides in ChildrenableMixin
		this.initializeChildren();

		// resides in routes-mixin
		this.registerAllRoutes();
	},
	getLabel: function getLabel() {
		var result = this.getOption('label', { args: [this, this.model] });
		return result;
	},
	getMenuLabel: function getMenuLabel() {
		var result = this.getOption('menuLabel', { args: [this, this.model], default: this.getLabel() });
		return result;
	},
	buildChildOptions: function buildChildOptions(options) {
		return _.extend({
			root: this.root,
			parent: this.parent,
			router: this.router
		}, options);
	},
	getSiblings: function getSiblings() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


		var parent = this.getParent();
		var options = _.extend({ exclude: [this] }, opts);
		return parent && parent.getChildren(options) || [];
	},
	getChildrenHashes: function getChildrenHashes() {
		return this.getChildren({ map: function map(i) {
				return i.getHash();
			}, visible: true });
	},
	getSiblingsHashes: function getSiblingsHashes() {
		return this.getSiblings({ map: function map(i) {
				return i.getHash();
			}, visible: true });
	},
	getAllPages: function getAllPages() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


		var options = _.extend({}, opts, { includeSelf: true });
		delete options.map;
		var pages = this.root.getAllChildren(options);

		if (_.isFunction(opts.map)) {
			return _(pages).chain().map(opts.map).filter(function (f) {
				return !!f;
			}).value();
		} else {
			return pages;
		}
	},
	getAllHashes: function getAllHashes() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		var options = _.extend({ map: function map(i) {
				return i.getHash();
			}, visible: true }, opts);
		return this.getAllPages(options);
	},
	getHash: function getHash() {
		var context = this.getMainRouteContext();

		if (!_.isObject(context)) return;

		var parent = this.getParent();
		var parentCid = parent && parent.cid || undefined;
		return {
			cid: this.cid,
			parentCid: parentCid,
			url: context.route,
			label: this.getMenuLabel(),
			order: this.order
		};
	},
	_childFilter: function _childFilter(item, index) {
		var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

		var base = BasePage.prototype._childFilter;
		if (base && !base.apply(this, arguments)) return;

		var visible = opts.visible;


		if (visible && (item.visible === false || item.hidden === true)) return;

		return item;
	}
});

// supports passing options to the callback
// by using new version of loadUrl
function historyNavigate(fragment, opts) {

	var options = opts === true ? { trigger: true } : _.isObject(opts) ? _.clone(opts) : {};

	var trigger = options.trigger;

	delete options.trigger;

	Backbone$1.history.navigate(fragment, options);

	if (trigger) {
		return historyLoadUrl(fragment, opts);
	}
}

// original loadUrl does not pass options to the callback
// and this one does
function historyLoadUrl(fragment) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


	// If the root doesn't match, no routes can match either.
	if (!Backbone$1.history.matchRoot()) return false;
	fragment = Backbone$1.history.fragment = Backbone$1.history.getFragment(fragment);
	var executed = executeHandler(fragment, opts);
	if (!executed) {
		errorHandler.handle('not:found', opts.context, [fragment]);
		//history.trigger('handler:not:found', fragment, opts);
	}
	return executed;
}

//TODO: think about constraints check
function testHandler(handler, fragment) {
	return handler.route.test(fragment);
}

function findHandler(fragment, customTest) {
	var test = _.isFunction(customTest) ? customTest : testHandler;
	fragment = Backbone$1.history.getFragment(fragment);
	return _.filter(Backbone$1.history.handlers || [], function (handler) {
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

function start(options) {

	if (Backbone$1.history.loadUrl !== historyLoadUrl) Backbone$1.history.loadUrl = historyLoadUrl;

	return Backbone$1.history.start(options);
}



var index$1 = Object.freeze({
	historyNavigate: historyNavigate,
	historyLoadUrl: historyLoadUrl,
	findHandler: findHandler,
	executeHandler: executeHandler,
	start: start,
	history: Backbone$1.history
});

var index$2 = _.extend({
	watch: function watch() {
		this.entries = [];
		this.listenTo(Backbone$1.history, 'route', this.onRoute);
		this.listenTo(Backbone$1.history, 'backroute', this.onBackRoute);
	},

	isActionContext: function isActionContext(cntx) {
		return _.isObject(cntx) && _.isString(cntx.fragment);
	},
	hasElements: function hasElements() {
		return this.entries.length > 0;
	},
	onRoute: function onRoute(actionContext) {

		if (!this.isActionContext(actionContext)) return;

		if (this.isActionContext(this.lastElement)) {
			this.entries.push(this.lastElement);
		}
		this.lastElement = actionContext;
	},
	onBackRoute: function onBackRoute(actionContext) {
		if (!this.isActionContext(actionContext) || !this.isActionContext(actionContext.gobackContext)) return;

		var lookFor = actionContext.gobackContext;
		var index = this.entries.indexOf(lookFor);
		if (index >= 0) {
			this.entries = this.entries.slice(0, index);
			this.lastElement = lookFor;
		}
	},
	goBack: function goBack() {
		var last = this.hasElements() && _(this.entries).last();
		historyNavigate(last.fragment, { trigger: true, routeType: 'backroute', gobackContext: last });
	}
}, Backbone$1.Events);

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

var index$3 = Object.freeze({
	execute: execute,
	navigate: navigate,
	navigateBack: navigateBack,
	go: go
});

// import Model from '../../b b/model';

var nativeAjax = Backbone$1.ajax;

var tokenizedAjax = function tokenizedAjax() {
	var options = void 0;

	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	if (args && args.length == 1 && _.isObject(args[0])) {
		options = args[0];
	}
	if (args && args.length == 2 && !_.isObject(args[0]) && _.isObject(args[1])) {
		options = args[1];
	}

	options && (options.headers = _.extend({}, options.headers, this.getAjaxHeaders()));

	return nativeAjax.apply($, args);
};

var Token = Backbone$1.Model.extend({

	tokenAttribute: 'access_token',
	refreshTokenAttribute: 'refresh_token',
	endPoint: 'auth/token',
	secondsOffset: 0,

	shouldRequestOnInitialize: true,

	constructor: function constructor() {
		this.ajaxHeaders = {};
		this.flows = {};
		this.initializeFlows();
		this.setExpiration(null);

		Backbone$1.Model.apply(this, arguments);

		if (this.shouldRequestOnInitialize) {
			this.getReady();
		}
	},
	getReady: function getReady() {
		var _this = this;

		if (this.ready) return this.ready;

		if (!this.hasToken()) {
			this.ready = Promise.resolve();
		} else {
			this.ready = this.refresh({ force: true }).catch(function () {
				_this.update(null);
			});
		}

		return this.ready;
	},
	initializeFlows: function initializeFlows() {

		this.setFlow('password', {
			url: this.endPoint,
			method: 'POST'
		});
		this.setFlow('refresh', {
			url: this.endPoint,
			method: 'POST'
		});
	},
	getFlow: function getFlow(key) {
		return _.clone(this.flows[key] || {});
	},
	setFlow: function setFlow(key, value) {
		this.flows[key] = value;
	},
	hasToken: function hasToken() {
		return this.getToken() != null;
	},
	getToken: function getToken() {
		return this.get(this.tokenAttribute);
	},
	getRefreshToken: function getRefreshToken() {
		return this.get(this.refreshTokenAttribute);
	},
	getAjaxHeaders: function getAjaxHeaders() {
		return this.ajaxHeaders;
	},
	parse: function parse(data) {
		return data;
	},
	fetch: function fetch() {
		var _this2 = this;

		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		if (this._fetching) return this._fetching;
		this._fetching = nativeAjax(options).then(function (json) {

			var parsed = _this2.parse(_.clone(json));
			_this2.update(parsed);
			delete _this2._fetching;
			return Promise.resolve(json);
		}, function (xhr) {

			delete _this2._fetching;

			options.clearOnFail !== false && _this2.update(null);

			var error = _this2.handleError(xhr);
			if (error) {

				return Promise.reject(error);
			} else {
				return Promise.reject(xhr);
			}
		});
		return this._fetching;
	},
	handleError: function handleError() {},
	update: function update(hash) {
		var _this3 = this;

		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		var silent = opts.silent;

		if (hash == null) {

			this.clear(opts);
		} else {
			var fullhash = _.extend({}, this.attributes, hash);
			var unset = [];
			var shouldUnset = !!opts.unset;
			var setHash = _(fullhash).reduce(function (memo, value, key) {
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
			this.set(setHash, { silent: silent });
			_(unset).each(function (key) {
				return _this3.unset(key, { silent: silent });
			});
		}

		this.reflectTokenChanges();
	},
	replaceBackboneAjax: function replaceBackboneAjax() {
		var _this4 = this;

		if (!this.hasToken()) Backbone$1__default.ajax = nativeAjax;else Backbone$1__default.ajax = function () {
			return _this4.ajax.apply(_this4, arguments);
		};
	},
	updateAjaxHeaders: function updateAjaxHeaders(token) {
		token || (token = this.getToken());
		var headers = this.getAjaxHeaders();
		if (token) {
			headers.Authorization = 'Bearer ' + token;
			headers.Accept = 'application/json';
		} else {
			delete headers.Authorization;
		}
	},


	//implement by your own
	storeToken: function storeToken() {},
	reflectTokenChanges: function reflectTokenChanges() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
		var silent = opts.silent,
		    _opts$store = opts.store,
		    store = _opts$store === undefined ? true : _opts$store;

		this.updateAjaxHeaders();
		this.replaceBackboneAjax();
		if (store) this.storeToken();
		if (!silent) this.trigger('changed');
	},
	ajax: function ajax$$1() {
		var _this5 = this;

		for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
			args[_key2] = arguments[_key2];
		}

		return this.refresh().then(function () {
			return tokenizedAjax.apply(_this5, args);
		}, function (error) {
			return Promise.reject(error);
		});
	},
	refresh: function refresh() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


		// if token is fresh enough and there is no force refresh
		// pass
		if (!this.isExpired() && !opts.force) {
			return Promise.resolve();
		}
		var options = this.getFlow('refresh');
		options.data = this.getRefreshTokenData();
		return this.fetch(options);
	},
	getRefreshTokenData: function getRefreshTokenData() {
		return {
			'grant_type': 'refresh_token',
			'refresh_token': this.getRefreshToken()
		};
	},
	setExpiration: function setExpiration(arg) {

		if (arg === null) {
			this.expiresAt = null;
		}

		var date = void 0;
		var now = new Date();

		if (_.isDate(arg)) {
			date = arg;
		} else if (_.isObject(arg)) {
			date = new Date();

			var seconds = arg.seconds,
			    minutes = arg.minutes,
			    hours = arg.hours,
			    days = arg.days;

			date.setDate(date.getDate() + (days || 0));
			date.setHours(date.getHours() + (hours || 0));
			date.setMinutes(date.getMinutes() + (minutes || 0));
			date.setSeconds(date.getSeconds() + (seconds || 0));
		}

		if (!_.isDate(date) || isNaN(date.valueOf()) || date < now) {
			date = new Date();
			date.setSeconds(now.getSeconds() + 90);
		}

		this.expiresAt = date;
	},
	getExpiration: function getExpiration() {
		return this.expiresAt;
	},
	isExpired: function isExpired() {
		var date = this.getExpiration();
		if (!_.isDate(date) || isNaN(date.valueOf())) return true;
		return date.valueOf() < Date.now() + this.secondsOffset * 1000;
	},
	login: function login(username, password) {

		var options = this.getFlow('password');
		options.data = { grant_type: 'password', username: username, password: password };
		options.clearOnFail = false;
		return this.fetch(options);
	}
});

Token.setNativeAjax = function (arg) {
	var old = nativeAjax;
	nativeAjax = arg;
	return old;
};

var borrow = {
	getOption: instanceGetOption,
	mergeOptions: mergeOptions,
	triggerMethod: triggerMethod
};

var collection = {

		//desc: setups the collection for ViewManager instance
		//returns: previous collection
		setCollection: function setCollection(collection) {
				var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
				    _ref$init = _ref.init,
				    init = _ref$init === undefined ? false : _ref$init;

				if (this.collection == collection) return;

				//take previous collection for return
				var previousCollection = this.collection;

				//take contexts to destroy
				var destroy = this._removeCollection() || [];

				this.collection = collection;

				if (collection == null && destroy.length) {
						this.trigger('change', { destroy: destroy });
						return;
				}

				init && this.initModels();
				this._setCollectionListeners();

				return previousCollection;
		},
		_clearCollectionStore: function _clearCollectionStore() {

				var store = this._store;
				store.filtered.length = 0;
				store.items.length = 0;
				store.byModel = {};
				store.isFiltered = false;
				store.isSorted = false;
		},
		_removeCollection: function _removeCollection() {
				if (this.collection == null) return;

				var previousCollection = this.collection;

				this.stopListening(previousCollection);

				var destroy = this._removeItems(previousCollection.models);

				delete this.collection;

				this._clearCollectionStore();

				delete this._modelsInitialized;

				return destroy;
		},
		_setCollectionListeners: function _setCollectionListeners() {
				if (!this.collection) return;
				this.listenTo(this.collection, 'update', this._onCollectionUpdate);
				this.listenTo(this.collection, 'reset', this._onCollectionReset);
				this.listenTo(this.collection, 'sort', this._onCollectionSort);
				if (this.collection.length === 0) {
						this.listenToOnce(this.collection, 'sync', this._onCollectionFirstFetch);
				}
		},


		//first run, initialized all collection models
		initModels: function initModels() {

				if (!this.enableCollection || this._modelsInitialized) return;

				this._rebuildModels();

				this._modelsInitialized = true;
		},
		_rebuildModels: function _rebuildModels() {
				var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
				    _ref2$sort = _ref2.sort,
				    sort = _ref2$sort === undefined ? true : _ref2$sort;

				var items = this._store.items;
				var filtered = this._store.filtered;
				items.length = 0;
				filtered.length = 0;

				var filter = this.getFilter();
				var models = this.collection.models;

				for (var index = 0, length = models.length; index < length; index++) {
						var model = models[index];

						var context = this._getModelContext(model, { create: true });
						context.index = index;

						this._storeContext(context);
						items.push(context);

						if (!filter || filter(context)) filtered.push(context);
				}
				this._store.isFiltered = true;

				sort && this._sortItems(filtered, { comparator: this.getComparator(), force: true }, 'rebuild');
				this._store.isSorted = sort;
		},
		_onCollectionUpdate: function _onCollectionUpdate(col) {
				var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
				var _opts$changes = opts.changes,
				    changes = _opts$changes === undefined ? {} : _opts$changes;
				var _changes$added = changes.added,
				    added = _changes$added === undefined ? [] : _changes$added,
				    _changes$removed = changes.removed,
				    removed = _changes$removed === undefined ? [] : _changes$removed,
				    _changes$merged = changes.merged,
				    merged = _changes$merged === undefined ? [] : _changes$merged;

				var destroy = void 0;
				if (removed.length) {

						destroy = this._removeItems(removed);
						this._rebuildModels();
				} else {
						if (added.length) {
								var data = this._filterItems(added, { force: true });
								this._addItems(data.attach, { isSorted: false });
						}
						if (merged.length) {
								this._store.isFiltered = false;
						}
						if ((added.length || merged.length) && !_.isFunction(this.getComparator())) {
								this._updateIndexes();
						}
				}
				this.processAndRender({ destroy: destroy });
		},
		_addItems: function _addItems(items) {
				var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
				    isSorted = _ref3.isSorted,
				    isFiltered = _ref3.isFiltered;

				if (!items || !items.length) return;

				isSorted != null && (this._store.isSorted = isSorted);
				isFiltered != null && (this._store.isFiltered = isFiltered);

				var filter = this.getFilter();

				var _items = this._store.items;
				var _filtered = this._store.filtered;

				for (var index = 0, length = items.length; index < length; index++) {
						var item = items[index];
						_items.push(item);
						if (!filter || filter(item)) _filtered.push(item);
				}
				this._store.isFiltered = true;
		},
		_onCollectionFirstFetch: function _onCollectionFirstFetch() {
				if (this.collection.length) return;
				this.processAndRender();
		},
		_onCollectionSort: function _onCollectionSort(col) {
				var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
				    add = _ref4.add,
				    merge = _ref4.merge,
				    remove = _ref4.remove;

				if (_.isFunction(this.getComparator())) return;
				if (add || remove || merge) {
						return;
				}

				this._updateIndexes();

				var items = this._getItems();
				this._sortItems(items, { comparator: this._dataComparator, force: true }, 'collectionsort');
				this._store.isSorted = true;
				this.processAndRender();
		},
		_onCollectionReset: function _onCollectionReset(col) {
				var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
				    _ref5$previousModels = _ref5.previousModels,
				    previousModels = _ref5$previousModels === undefined ? [] : _ref5$previousModels;

				var destroy = this._removeItems(previousModels);
				this._rebuildModels();
				this.processAndRender({ destroy: destroy });
		}
};

var common = {
	_ensureOptions: function _ensureOptions() {
		if (!this.view) throw new Error('view is not set');

		if (!this.$container) {
			this.$container = this.view.$el;
		}
	},
	getPaginator: function getPaginator() {
		var skip = this.skip || 0;
		var take = this.take || Infinity;
		!_.isNumber(skip) || skip < 0 && (skip = 0);
		!_.isNumber(take) || take < 0 && (take = Infinity);
		if (skip == 0 && take == Infinity) return;else return {
			from: skip,
			to: skip + take
		};
	},
	_dataComparator: function _dataComparator(a, b) {
		return a.index - b.index;
	},
	getComparator: function getComparator() {
		return this.dataComparator;
	},
	setComparator: function setComparator(comparator) {
		var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
		    preventRender = _ref.preventRender;

		if (this.dataComparator == comparator) return;

		this.dataComparator = comparator;
		this._store.isSorted = false;

		if (!preventRender) this.processAndRender();
	},
	getFilter: function getFilter() {
		return this.dataFilter;
	},
	setFilter: function setFilter(filter) {
		var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
		    preventRender = _ref2.preventRender;

		if (this.dataFilter == filter) return;

		this.dataFilter = filter;
		this._store.isFiltered = false;
		if (!preventRender) this.processAndRender();
	}
};

var customs = {
	getCustoms: function getCustoms() {
		return this._store.customs;
	},
	addCustomView: function addCustomView(arg, index) {
		var customContext = this._normalizeAddCustomContext(arg, index);
		if (!customContext) {
			return;
		}
		this._store.customs.push(customContext);
		if (isView(customContext.view) && !customContext.view._isDestroyed) {
			this._setupJustCreatedView(customContext.view, customContext);
		}
	},
	removeCustomViews: function removeCustomViews() {
		var _this = this;

		var customs = this.getCustoms() || [];
		_.each(customs, function (custom) {
			if (!custom.view) return;

			if (_this._checkCustomCondition(custom.view, custom)) {
				return;
			}

			if (custom.rebuild) _this._destroyChildView(custom.view);else _this._detachChildView(custom.view);
		});
	},
	_checkCustomCondition: function _checkCustomCondition(customView, custom) {

		if (this.enableFilterForCustomViews) {
			var filter = this.getFilter();
			return !filter || filter(customView);
		}

		if (_.isFunction(custom.condition)) {
			return custom.condition.call(this.view, customView, this.view);
		} else if (custom.condition != null) {
			return custom.condition;
		} else {
			return true;
		}
	},
	_injectCustoms: function _injectCustoms(items, detached, destroyed) {
		var _this2 = this;

		if (this.collection && !items.length) {
			items = [];
			this._injectEmptyView(items);
		}

		var customs = this.getCustoms() || [];

		if (!customs.length) return items;

		var newitems = items.slice(0);
		_.each(customs, function (custom) {

			var view = _this2._ensureContextHasView(custom);
			if (!view) return;

			if (!_this2._checkCustomCondition(view, custom)) {
				// if (custom.rebuild) {
				// 	destroyed.push(view);
				// } else {
				// }
				detached.push(custom);
				return;
			}

			if (custom.index == null) {
				newitems.push(custom);
			} else {
				newitems.splice(custom.index, 0, custom);
			}
		});
		return newitems;
	},
	_normalizeAddCustomContext: function _normalizeAddCustomContext(arg, index) {
		var _this3 = this;

		if (isView(arg) && !arg._isDestroyed) {
			return {
				view: arg,
				rebuild: false,
				index: index
			};
		} else if (_.isFunction(arg) && isViewClass(arg)) {
			return {
				build: function build() {
					return new arg();
				},
				index: index,
				rebuild: true
			};
		} else if (_.isFunction(arg)) {
			return {
				build: arg,
				index: index,
				rebuild: true
			};
		} else if (_.isObject(arg) && !isView(arg)) {
			if (arg.build == null && arg.view == null) {
				return;
			}
			if (index != null) arg.index = index;

			if (_.isFunction(arg.view)) {
				var viewFn = arg.view;
				delete arg.view;
				var options = arg.options;
				if (isViewClass(viewFn)) {
					arg.build = function () {
						return new viewFn(betterResult({ options: options }, 'options', { context: _this3.view }));
					};
				} else {
					arg.build = function () {
						return viewFn.call(_this3.view, betterResult({ options: options }, 'options', { context: _this3.view }));
					};
				}
			}

			if (arg.rebuild == null) {
				arg.rebuild = !isView(arg.view);
			}
			return arg;
		}
	}
};

function isInPage(paginator, index) {
	return !paginator || index >= paginator.from && index < paginator.to;
}

function viewIsGood(view) {
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

	var shouldTriggerDetach = view._isAttached && !disableDetachEvents;

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
	process: function process() {
		var _this = this;

		var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
		    _ref$destroy = _ref.destroy,
		    destroy = _ref$destroy === undefined ? [] : _ref$destroy,
		    silent = _ref.silent,
		    forceSort = _ref.forceSort,
		    forceFilter = _ref.forceFilter;

		this._removeEmptyViewInstance({ destroy: destroy });

		var items = this._getItems({ forceFilter: forceFilter });

		var totalDetach = [];

		if (!this._store.isFiltered || forceFilter) {
			var _filterItems = this._filterItems(items, { filter: this.getFilter() }),
			    _attach = _filterItems.attach,
			    detach = _filterItems.detach;

			this._setItems(_attach, { isFiltered: true });
			items = _attach;
			if (detach.length) {
				//resultData.detach = resultData.detach.concat(detach);
				totalDetach = totalDetach.concat(detach);
			}
			//resultDetach = detach;
		}
		this._sortItems(items, { comparator: this.getComparator(), force: forceSort }, 'process');
		this._store.isSorted = true;

		var data = this._filterItems(items, { paginator: this.getPaginator() });
		if (data.detach.length) {
			//resultData.detach = resultData.detach.concat(data.detach);
			totalDetach = totalDetach.concat(data.detach);
		}

		var attach = this._injectCustoms(data.attach, totalDetach, destroy);

		var result = {
			attach: attach,
			detach: totalDetach,
			destroy: destroy,
			total: data.total,
			skiped: data.skiped,
			taked: data.taked
		};

		this.lastResult = result;
		if (!silent) setTimeout(function () {
			return _this.trigger('change', result);
		}, 0);

		return result;
	},
	_getItems: function _getItems() {
		var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
		    forceFilter = _ref2.forceFilter;

		if (this._store.isFiltered && !forceFilter) return this._store.filtered;else return this._store.items;
	},
	_filterItems: function _filterItems(items) {
		var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
		    filter = _ref3.filter,
		    paginator = _ref3.paginator,
		    force = _ref3.force;

		var iterator = -1;
		var detach = [];
		var attach = [];

		if (!filter && !paginator && !force) {

			return { attach: items, detach: [] };
		}

		var shouldUpdateIndex = this.collection && items == this.collection.models;

		for (var index = 0, length = items.length; index < length; index++) {

			var model = items[index];
			var item = model;
			var isModel = model instanceof Backbone.Model;
			var isNew = false;

			if (isModel) {
				item = this._getModelContext(model, { create: true, markNew: true });
				isNew = item.isNew === true;
			}

			var pass = !filter || filter(item);
			if (!pass) {
				item.view && !item.view._isDestroyed && detach.push(item);
				continue;
			}

			if (isInPage(paginator, ++iterator)) {
				attach.push(item);

				if (shouldUpdateIndex) {
					item.index = index;
				}
				if (isNew) {
					this._storeContext(item);
				}
			} else if (paginator && iterator > paginator.to) {
				break;
			}
		}

		var res = { attach: attach, detach: detach };
		if (paginator) {
			res.total = items.length;
			res.skiped = paginator.from;
			res.taked = iterator - paginator.from - 1;
		}

		// resultData.attach = attach;
		// resultData.detach = detach;

		return res;
	},
	_sortItems: function _sortItems(items) {
		var _this2 = this;

		var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
		    comparator = _ref4.comparator,
		    force = _ref4.force;

		if (this._store.isSorted && !force) {
			return;
		}

		if (!comparator) {
			comparator = this._dataComparator;
			if (!comparator) return;
		}

		if (this._store.isFiltered && items !== this._store.items) {
			setTimeout(function () {
				return _this2._sortItems(_this2._store.items, { comparator: comparator, force: true }, 'timeout sort');
			}, 0);
		}

		var iteratee = comparator.length == 1 ? function (a, b) {
			var _a = comparator(a);var _b = comparator(b);
			if (_a < _b) return -1;
			if (_a > _b) return 1;
			return 0;
		} : comparator;

		items.sort(iteratee);
	},
	_setItems: function _setItems(items) {
		var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
		    isSorted = _ref5.isSorted,
		    isFiltered = _ref5.isFiltered;

		isSorted != null && (this._store.isSorted = isSorted);
		isFiltered != null && (this._store.isFiltered = isFiltered);
		if (isFiltered) {
			this._store.filtered = items;
		} else {
			this._store.items = items;
		}
	},
	_removeItems: function _removeItems() {
		var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];


		var destroy = [];
		for (var index = 0, length = items.length; index < length; index++) {
			var item = items[index];
			var view = this._removeItem(item);
			view && destroy.push(view);
		}
		return destroy;
	},
	_removeItem: function _removeItem(item) {
		var model = item instanceof Backbone.Model ? item : item.model;
		var context = this._store.byModel[model.id] || this._store.byModel[model.cid];
		delete this._store.byModel[model.id];
		delete this._store.byModel[model.cid];
		return context.view;
	},
	_getModelView: function _getModelView(model) {
		var id = model.id == null ? model.cid : model.id;
		var context = this._store.byModel[id];
		return context && context.view;
	},
	_getModelContext: function _getModelContext(model) {
		var _ref6 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
		    create = _ref6.create,
		    markNew = _ref6.markNew;

		var id = model.id == null ? model.cid : model.id;
		var context = this._store.byModel[id];
		if (context) {
			return context;
		}
		if (create) {
			context = { model: model, isCollection: true };
			markNew && (context.isNew = true);
			return context;
		}
	},
	_storeContext: function _storeContext(context) {
		var id = context.model.id;
		context.isNew && delete context.isNew;
		if (id != null) this._store.byModel[id] = context;
		this._store.byModel[context.model.cid] = context;
	},
	_initView: function _initView(context) {
		if (context.view && !context.view._isDestroyed) return;
		context.view = this.createView(context.model);
	},
	_updateIndexes: function _updateIndexes() {

		var models = this.collection.models;
		for (var index = 0, length = models.length; index < length; index++) {
			var model = models[index];
			var id = model.id == null ? model.cid : model.id;
			var context = this._store.byModel[id];
			context && (context.index = index);
		}
	}
};

var render = {
	triggerViewMethod: function triggerViewMethod() {
		this.view.triggerMethod.apply(this.view, arguments);
	},
	getChildrenContainer: function getChildrenContainer() {
		if (_.isString(this.$container)) return this.view.$(this.$container);else if (_.isFunction(this.$container)) return this.$container();else return this.$container;
	},
	processAndRender: function processAndRender(opts) {
		var data = this.process(opts);
		this.render(data);
	},
	beforeRender: function beforeRender() {
		if (this.view._isRendered) {
			this.removeCustomViews();
		} else {
			this.initModels();
		}
	},
	render: function render(data) {
		if (!data) {
			return;
		} else {

			this.triggerViewMethod('before:render:children', data);

			// if(this.view._isRendered)
			// 	this.removeCustomViews();

			this._destroyChildViews(data.destroy);
			this._detachChildViews(data.detach);
			this._attachChildViews(data.attach);

			this.triggerViewMethod('render:children', data);
		}
	},
	_destroyChildViews: function _destroyChildViews() {
		var _this = this;

		var views = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

		if (!views.length) return;
		var $container = this.getChildrenContainer();
		this.triggerViewMethod('before:destroy:children', this);

		if (this.view.monitorViewEvents === false) {
			this.view.Dom.detachContents($container);
		}

		var shouldDisableEvents = this.view.monitorViewEvents === false;
		_.each(views, function (view) {
			_this._destroyChildView(view, shouldDisableEvents);
		});

		this.triggerViewMethod('destroy:children', this);
	},
	_destroyChildView: function _destroyChildView(view, shouldDisableEvents) {

		if (shouldDisableEvents == null) shouldDisableEvents = this.view.monitorViewEvents === false;

		//view.off('destroy', this.removeChildView, this);
		if (!view || view._isDestroyed) {
			return;
		}
		destroyView(view, shouldDisableEvents);
		this.view.stopListening(view);
	},
	_detachChildViews: function _detachChildViews() {
		var _this2 = this;

		var contexts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

		if (!contexts.length) return;
		var monitorViewEvents = this.monitorViewEvents !== false;
		_.each(contexts, function (context) {
			_this2._detachChildView(context.view, monitorViewEvents);
		});
	},
	_detachChildView: function _detachChildView(view, monitorViewEvents) {
		if (!view) return;
		if (monitorViewEvents == null) {
			monitorViewEvents = this.view.monitorViewEvents !== false;
		}
		var shouldTriggerDetach = view._isAttached && monitorViewEvents;
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
	_attachChildViews: function _attachChildViews() {
		var _this3 = this;

		var contexts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

		if (!contexts.length) return;

		var shouldTriggerAttach = this.view._isAttached && this.view.monitorViewEvents !== false;

		var elBuffer = this.view.Dom.createBuffer();
		var $container = this.getChildrenContainer();
		_.each(contexts, function (context) {
			var view = _this3._ensureContextHasView(context);

			if (!view) return;

			!view._isRendered && renderView(view);
			_this3.view.Dom.appendContents(elBuffer, view.el, { _$contents: view.$el });

			if (shouldTriggerAttach && !view._isAttached) {
				view.triggerMethod('before:attach', view);
			}
		});

		this.view.Dom.appendContents($container[0], elBuffer, { _$el: $container });

		if (shouldTriggerAttach) {
			_.each(contexts, function (context) {
				var view = context.view;
				if (!view || view._isAttached) return;
				view._isAttached = true;
				view.triggerMethod('attach', view);
			});
		}
	},
	_ensureContextHasView: function _ensureContextHasView(context) {
		if (viewIsGood(context.view)) return context.view;else if (context.isCollection) {
			context.view = this._createModelChildView(context.model);
			return context.view;
		} else if (context.rebuild && _.isFunction(context.build)) {
			context.view = this._createCustomChildView(context);
			return context.view;
		}
	},
	_createChildView: function _createChildView(context) {
		var created = void 0;
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
	_createCustomChildView: function _createCustomChildView(context) {
		return context.build();
	},
	_createModelChildView: function _createModelChildView(model) {
		var View$$1 = this._getChildViewClass(model);
		if (!View$$1) return;
		var options = this._getChildViewOptions(model, View$$1);
		var view = new View$$1(options);
		return view;
	},
	_setupJustCreatedView: function _setupJustCreatedView(view, context) {
		if (_.isFunction(context.onBuild)) {
			context.onBuild.call(this.view, view);
		}
		this.view._proxyChildViewEvents(view);
	},
	_getChildViewClass: function _getChildViewClass(model) {
		if (this.modelView === Backbone.View || this.modelView.prototype instanceof Backbone.View) return this.modelView;else {
			return this.modelView(model);
		}
	},
	_getChildViewOptions: function _getChildViewOptions(model, View$$1) {
		var options = {};
		if (_.isFunction(this.modelViewOptions)) {
			options = this.modelViewOptions.call(this, model, View$$1, this) || {};
		} else if (_.isObject(this.modelViewOptions)) {
			options = this.modelViewOptions;
		}
		return _.extend({}, options, { model: model });
	}
};

var EmptyViewMixin = {
	removeEmptyViewInstance: function removeEmptyViewInstance() {
		var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		var view = this._emptyViewInstance;
		if (!view) return;
		var _opts$destroy = opts.destroy,
		    destroy = _opts$destroy === undefined ? [] : _opts$destroy;

		if (view) {
			delete this._emptyViewInstance;
			destroy.push(view);
			opts.destroy = destroy;
		}
	},
	_getEmptyViewClas: function _getEmptyViewClas() {
		if (!this.emptyView) {
			return;
		} else if (isViewClass(this.emptyView)) {
			return this.emptyView;
		} else if (_.isFunction(this.emptyView)) {
			return this.emptyView.call(this.view);
		}
	},
	_injectEmptyView: function _injectEmptyView(items) {
		var View$$1 = this._getEmptyViewClas();
		if (!View$$1) return;
		var options = _.extend({}, this.emptyViewOptions);
		var view = new View$$1(options);
		this._emptyViewInstance = view;
		items.push({ view: view });
	},
	_removeEmptyViewInstance: function _removeEmptyViewInstance() {
		var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
		    _ref$destroy = _ref.destroy,
		    destroy = _ref$destroy === undefined ? [] : _ref$destroy;

		var view = this._emptyViewInstance;
		if (!view) return;

		if (view) {
			delete this._emptyViewInstance;
			destroy.push(view);
		}
	}
};

var MergeOptions = ['createView', 'dataFilter', 'dataComparator', 'enableCollection', '$container', 'view', 'modelView', 'modelViewOptions', 'emptyView', 'emptyViewOptions', 'enableFilterForCustomViews'];

var ViewManager = function ViewManager() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		this.options = _.omit(options, 'collection');
		this.mergeOptions(options, MergeOptions);
		this._ensureOptions();
		this._store = {

				//holds current filtered set of model contexts
				filtered: [],

				//holds all model contexts
				items: [],

				//grants fast access to a context through model id or cid
				byModel: {},

				//holds all cutoms contexts
				customs: [],

				//indicates if comparator should be applied
				isSorted: false,

				//indicates if filter should be applied
				isFiltered: false

		};

		//in collection mixin
		if (this.enableCollection) this.setCollection(this.collection || options.collection);
};

ViewManager.extend = extend;

_.extend(ViewManager.prototype, Backbone$1.Events, borrow, collection, common, customs, models, render, EmptyViewMixin);

var _disallowedKeys = ['setItem', 'key', 'getItem', 'removeItem', 'clear'];
var allowedKey = function allowedKey(key) {
	return _disallowedKeys.indexOf(key) < 0;
};

var fake = {
	setItem: function setItem(id, val) {
		if (!allowedKey(id)) return;
		return this[id] = String(val);
	},
	getItem: function getItem(id) {
		if (!allowedKey(id)) return;
		return this[id];
	},
	removeItem: function removeItem(id) {
		if (!allowedKey(id)) return;
		delete this[id];
	},
	clear: function clear() {
		var _this = this;

		var keys = _(this).keys();
		_(keys).each(function (key) {
			return _this.removeItem(key);
		});
	}
};

var session = typeof sessionStorage === 'undefined' ? fake : sessionStorage;

var local = typeof localStorage === 'undefined' ? fake : localStorage;

var getStore = function getStore() {
	var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	return opts.local === true ? local : session;
};

var SECONDS = 1000;
var MINUTES = SECONDS * 60;
var HOURS = MINUTES * 60;
var DAYS = HOURS * 24;

var store = {
	_normalizeValue: function _normalizeValue(value) {
		var normValue = value;
		if (_.isObject(value) && _.isFunction(value.toJSON)) normValue = value.toJSON();
		if (_.isDate(value) && !_.isNaN(value.valueOf())) normValue = 'date(' + normValue + ')';
		return normValue;
	},
	_createItem: function _createItem(value, expireAt) {
		return { expireAt: expireAt, value: value };
	},
	jsonParse: function jsonParse(key, value) {
		var datePattern = /^date\((\d{4,4}-\d{2,2}-\d{2,2}([T\s]\d{2,2}:\d{2,2}:\d{2,2}(\.\d*)?Z?)?)\)$/;
		if (_.isString(value) && datePattern.test(value)) {
			var textDate = value.replace(datePattern, '$1');
			return new Date(textDate);
		}
		return value;
	},
	_jsonParse: function _jsonParse(key, value, context) {
		if (!key) return value;
		return this.jsonParse(key, value, context);
	},
	_parse: function _parse(raw) {
		var _this = this;
		var item = JSON.parse(raw, function (key, value) {
			return _this._jsonParse(key, value, this);
		});
		if ('expireAt' in item && 'value' in item) return item;else return this._createItem(item, 0);
	},
	_get: function _get(key, opts) {
		var raw = getStore(opts).getItem(key);
		if (raw == null) return;
		return this._parse(raw);
	},
	get: function get(key) {
		var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		var _opts$checkExpire = opts.checkExpire,
		    checkExpire = _opts$checkExpire === undefined ? true : _opts$checkExpire;


		var item = this._get(key, opts);
		if (item == null) return;

		var expired = this._isExpired(item);
		if (!expired || !checkExpire) {

			return item.value;
		} else if (expired) {
			this.remove(key, opts);
		}
	},
	set: function set(key, value) {
		var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};


		var expireAt = Date.now() + this.getExpireAt(opts);
		var normValue = this._normalizeValue(value);
		var item = this._createItem(normValue, expireAt);
		this._set(key, item, opts);
	},
	remove: function remove(key, opts) {
		getStore(opts).removeItem(key);
	},
	expire: function expire(key, opts) {
		var item = this._get(key, opts);
		if (!item) return;
		item.expireAt = 0;
		this._set(key, item, opts);
	},
	getExpireAt: function getExpireAt(_ref) {
		var expireAt = _ref.expireAt,
		    seconds = _ref.seconds,
		    minutes = _ref.minutes,
		    hours = _ref.hours,
		    days = _ref.days;

		if (expireAt != null) return expireAt;

		var offset = 0;

		_.isNumber(seconds) && (offset += seconds * SECONDS);
		_.isNumber(minutes) && (offset += minutes * MINUTES);
		_.isNumber(hours) && (offset += hours * HOURS);
		_.isNumber(days) && (offset += days * DAYS);

		offset === 0 && (offset += 10 * MINUTES);

		return offset;
	},
	_set: function _set(key, item, opts) {
		var text = JSON.stringify(item);
		getStore(opts).setItem(key, text);
	},
	isExpired: function isExpired(key, opts) {
		var item = this._get(key, opts);
		if (item == null) return true;
		return this._isExpired(item);
	},
	_isExpired: function _isExpired(item) {
		return item.expireAt < Date.now();
	}
};

var errorProps = ['description', 'fileName', 'lineNumber', 'name', 'message', 'number', 'url'];
function normalizeAppErrorOptions() {
	var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	if (_.isString(data)) {
		data = { message: data };
	}
	return data;
}
var AppError = extend.call(Error, {
	urlRoot: '',
	url: '',
	name: 'app:error',
	constructor: function constructor(options) {
		if (!(this instanceof AppError)) {
			return new AppError(_.extend({}, options, { newKeywordOmited: true }));
		}
		options = normalizeAppErrorOptions(options);
		var url = options.url;
		delete options.url;

		var error = Error.call(this, options.message);
		var important = {
			name: options.name || this.name,
			message: options.message || this.message
		};
		if (url || this.url) {
			important.url = (this.urlRoot || '') + (url || this.url || '');
		}
		options.name = important.name;
		_.extend(this, important, _.pick(error, errorProps), options);

		if (Error.captureStackTrace) {
			this.captureStackTrace();
		}
		if (options.url) this.url = this.urlRoot + this.url;
	},
	captureStackTrace: function captureStackTrace() {
		Error.captureStackTrace(this, this.constructor);
	},
	toString: function toString() {
		var url = this.url ? ' See: ' + this.url : '';
		return this.name + ': ' + this.message + url;
	}
});
// AppError.setUrlRoot = function(url){
// 	this.prototype.urlRoot = url;
// };
AppError.extend = extend;

var ViewStack = function ViewStack() {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	this.cid = _.uniqueId('stack');
	this.unremovableKey = '_' + this.cid + '_preventRemove';
	this.destroyOnRemove = true;
	this.removeOnEsc = true, this.removeOnOutsideClick = true, this.options = options;
	this.stack = [];
};
_.extend(ViewStack.prototype, Backbone$1.Events, {
	add: function add(view, options) {
		if (!_.isObject(view)) {
			return;
		}

		this.triggerMethod('before:add');

		this.stack.push(view);
		this._setupView(view, options);

		this._stackChanged(1, view);
	},
	_setupView: function _setupView(view) {
		var _this = this;

		var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
		    preventRemove = _ref.preventRemove;

		if (preventRemove) {
			var key = this.getUnremovableKey();
			view[key] = true;
		}
		this.listenToOnce(view, 'destroy', function () {
			return _this._removeView(view, { selfDestroy: true });
		});
	},
	remove: function remove(view) {
		var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
		    destroy = _ref2.destroy;

		var destroyOnRemove = this.getOption('destroyOnRemove');
		var removed = this._removeView(view);
		if (removed && (destroy || destroyOnRemove)) {
			this._destroyView(view);
		}
	},
	getLast: function getLast() {
		return _.last(this.stack);
	},
	removeLast: function removeLast() {
		var view = this.getLast();
		this.remove(view);
	},
	destroyLast: function destroyLast() {
		var view = this.getLast();
		this.remove(view, { destroy: true });
	},
	_removeView: function _removeView(view) {
		var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
		    selfDestroy = _ref3.selfDestroy;

		if (!_.isObject(view)) {
			return;
		}

		if (this.isViewUnremovable(view, selfDestroy)) {
			return;
		}

		this._cleanUpView(view);

		var index = this.stack.indexOf(view);
		if (index === -1) return;

		if (index == this.stack.length - 1) this.stack.pop();else this.stack.splice(index, 1);

		this._stackChanged(-1);

		return view;
	},
	_cleanUpView: function _cleanUpView(view) {
		this.stopListening(view);
		delete view[this.getUnremovableKey()];
	},
	_destroyView: function _destroyView(view) {
		if (_.isObject(view) && _.isFunction(view.destroy)) {
			view.destroy();
		}
	},
	_stackChanged: function _stackChanged(change, view) {
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
	getUnremovableKey: function getUnremovableKey() {
		return this.getOption('unremovableKey');
	},

	// options is for internal use only.
	// self destroy flag filled when a view destroyed outside the stack
	isViewUnremovable: function isViewUnremovable(view) {
		var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
		    selfDestroy = _ref4.selfDestroy;

		if (selfDestroy) return false;
		var key = this.getUnremovableKey();
		return view[key];
	},


	/*
 	DOM listeners logic
 	- esc handler
 	- outside click handler
 */
	getViewDomElement: function getViewDomElement(view) {
		return view && view.el;
	},
	isElementOutsideOfView: function isElementOutsideOfView(eventElement, view) {
		var viewElement = this.getViewDomElement(view);
		if (!viewElement) return;
		return !$.contains(viewElement, eventElement);
	},
	getViewIfElementOutside: function getViewIfElementOutside(eventElement) {
		var view = this.getLast();
		if (!view) return;
		if (this.isElementOutsideOfView(eventElement, view)) {
			return view;
		}
	},
	outsideClickHandler: function outsideClickHandler(event) {
		if (!this.stack.length) {
			return;
		}

		var view = this.getViewIfElementOutside(event.target);
		if (!view) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		this.remove(view);
	},
	escapePressHandler: function escapePressHandler(event) {
		if (!this.stack.length || event.keyCode !== 27) return;

		event.preventDefault();
		event.stopPropagation();
		this.removeLast();
	},
	_setDocumentListeners: function _setDocumentListeners() {
		if (this._documentListeners || !this.stack.length) return;
		var $doc = this.getDocument();
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
	_unsetDocumentListeners: function _unsetDocumentListeners() {
		if (!(this._documentListeners && !this.stack.length)) return;
		var $doc = this.getDocument();
		if (this._escapePressHandler) {
			$doc.off('keyup', this._escapePressHandler);
			delete this._escapePressHandler;
			this.triggerMethod('dom:listeners:escape:off');
		}
		if (this._outsideClickHandler) {
			$doc.off('click', this._outsideClickHandler);
			delete this._outsideClickHandler;
			this.triggerMethod('dom:listeners:click:off');
		}
		this.triggerMethod('dom:listeners:off');
		this._documentListeners = false;
	},
	_shouldRemoveOnEsc: function _shouldRemoveOnEsc() {
		return this.getOption('removeOnEsc') === true;
	},
	_shouldRemoveOnOutsideClick: function _shouldRemoveOnOutsideClick() {
		return this.getOption('removeOnOutsideClick') === true;
	},


	/*
 	helper methods
 */
	getOption: instanceGetOption,
	triggerMethod: triggerMethod,

	getDocument: function getDocument() {
		return this.$doc || $(document);
	},
	isDestroyed: function isDestroyed() {
		return this._isDestroyed || this._isDestroying;
	},
	destroy: function destroy() {
		if (this._isDestroyed || this._isDestroying) {
			return;
		}
		this._isDestroying = true;

		this.triggerMethod('before:destroy');
		var $doc = this.getDocument();
		while (this.stack.length) {
			this.destroyLast();
		}
		$doc.off('keyup', this._onKeyUp);
		$doc.off('click', this._outsideClick);

		this._isDestroyed = true;
		this.triggerMethod('destroy');
	}
});

var config = {
	destroySelfOnEmpty: false,
	destroyOnEmpty: false
};

var BaseNodeRegion = Mn.Region.extend({
	onEmpty: function onEmpty() {
		var destroySelf = this.getOption('destroySelfOnEmpty') || this.getOption('destroyOnEmpty');
		var destroyNode = this.getOption('destroyOnEmpty');
		destroySelf && this.destroy();
		destroyNode && this.el.remove();
	}
});

config.Region = BaseNodeRegion;

function normalizeElement(selector) {
	var body = document.querySelector('body');
	var el = void 0;
	if (selector == null) {
		el = body;
	} else if (selector instanceof Element) {
		el = selector;
	} else if (selector && selector.jquery) {
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

function renderInNode(view) {
	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    el = _ref.el,
	    _ref$replaceElement = _ref.replaceElement,
	    replaceElement = _ref$replaceElement === undefined ? false : _ref$replaceElement,
	    _ref$destroySelfOnEmp = _ref.destroySelfOnEmpty,
	    destroySelfOnEmpty = _ref$destroySelfOnEmp === undefined ? config.destroySelfOnEmpty : _ref$destroySelfOnEmp,
	    _ref$destroyOnEmpty = _ref.destroyOnEmpty,
	    destroyOnEmpty = _ref$destroyOnEmpty === undefined ? config.destroyOnEmpty : _ref$destroyOnEmpty;

	var NodeRegion = config.Region;
	el = normalizeElement(el);
	var body = document.querySelector('body');
	if (el === body) {
		el = document.createElement('div');
		body.appendChild(el);
		replaceElement = true;
	}
	var region = new NodeRegion({ el: el, replaceElement: replaceElement, destroySelfOnEmpty: destroySelfOnEmpty, destroyOnEmpty: destroyOnEmpty });
	region.show(view);
}

var index$4 = (function (CollectionView) {
	return CollectionView.extend({
		shouldHandleEmptyFetch: true,
		constructor: function constructor() {
			CollectionView.apply(this, arguments);

			this.getOption('shouldHandleEmptyFetch') && this.emptyView && this._handleEmptyFetch();
		},
		_handleEmptyFetch: function _handleEmptyFetch() {
			var _this = this;

			if (!this.collection || this.collection.length) {
				return;
			}

			this.listenToOnce(this.collection, 'sync', function () {
				return !_this.collection.length && _this._renderChildren();
			});
		}
	});
});

function rebuildIndexes() {
	if (!this.getOption('shouldRebuildIndexes') || !this.collection) {
		return;
	}
	var models = this.collection.models;
	for (var index = 0, length = models.length; index < length; index++) {
		var model = models[index];
		var view = this._children.findByModel(model);
		view && (view._index = index);
	}
}

var index$5 = (function (CollectionView) {
	return CollectionView.extend({
		shouldRebuildIndexes: true,

		constructor: function constructor() {

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
		_addChild: function _addChild(view, index) {
			view._isModelView = arguments.length === 1;
			if (index != null) {
				view._index = index;
			}
			return CollectionView.prototype._addChild.apply(this, arguments);
		},
		_viewComparator: function _viewComparator(v1, v2) {
			var res = v1._index - v2._index;
			if (res) return res;
			if (v1._isModelView) return 1;
			return -1;
		}
	});
});

var nextCollectionView = (function (CollectionView) {
	return CollectionView.extend({
		_renderChildren: function _renderChildren() {
			// If there are unrendered views prevent add to end perf
			if (this._hasUnrenderedViews) {
				delete this._addedViews;
				delete this._hasUnrenderedViews;
			}

			var views = this._addedViews || this.children._views;

			this.triggerMethod('before:render:children', this, views);

			this._showEmptyView();

			var els = this._getBuffer(views);

			this._attachChildren(els, views);

			delete this._addedViews;

			this.triggerMethod('render:children', this, views);
		},
		addChildView: function addChildView(view, index) {
			var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

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

			var hasIndex = typeof index !== 'undefined';
			var isAddedToEnd = !hasIndex || index >= this._children.length;

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
		_showEmptyView: function _showEmptyView() {

			this._destroyEmptyView();

			if (!this.isEmpty()) {
				return;
			}

			var EmptyView = this._getEmptyView();
			if (!EmptyView) {
				return;
			}

			var options = this._getEmptyViewOptions();
			this._emptyViewInstance = new EmptyView(options);

			this.addChildView(this._emptyViewInstance, { preventRender: true, index: 0 });
		},
		_destroyEmptyView: function _destroyEmptyView() {
			var view = this._emptyViewInstance;
			if (!view) return;

			this._removeChildView(view);

			this._removeChild(view);

			view.destroy();
			delete this._emptyViewInstance;
		}
	}, { CollectionViewMixin_4x: true });
});

var customs$1 = (function (Base) {
	return Base.extend({

		renderAllCustoms: false,
		shouldMergeCustoms: false,

		constructor: function constructor() {
			this._customs = [];
			Base.apply(this, arguments);
			this._initializeCustoms();
		},
		_initializeCustoms: function _initializeCustoms() {
			var _customs;

			var optionsCustoms = betterResult(this.options, 'customs', { args: [this], context: this });
			var instanceCustoms = betterResult(this, 'customs', { args: [this] });
			var shouldMergeCustoms = this.getOption('shouldMergeCustoms');
			var add = void 0;
			if (shouldMergeCustoms) {
				add = (instanceCustoms || []).concat(optionsCustoms || []);
			} else {
				add = instanceCustoms || optionsCustoms || [];
			}
			(_customs = this._customs).push.apply(_customs, toConsumableArray(add));

			if (this.getOption('renderAllCustoms')) {
				this.on('render', this._renderCustoms);
			}
		},
		_renderCustoms: function _renderCustoms() {
			if (!this.getOption('renderAllCustoms')) return;
			var customs = this.getCustoms();
			this.triggerMethod('before:customs:render');
			this.addChildViews(customs);
			this.triggerMethod('customs:render');
		},
		getCustoms: function getCustoms() {
			return this._prepareCustoms(this._customs.slice(0));
		},
		_prepareCustoms: function _prepareCustoms(rawcustoms) {
			var _this = this;

			return _.reduce(rawcustoms, function (array, item) {
				var args = _this._prepareCustom(item);
				args && (args = _this.buildCustom.apply(_this, toConsumableArray(args)));
				args && array.push(args);
				return array;
			}, []);
		},
		_prepareCustom: function _prepareCustom(arg) {
			if (_.isFunction(arg)) {
				return this._prepareCustom(arg.call(this, this));
			} else if (_.isArray(arg)) {
				return arg;
			} else {
				return [arg, { index: 0 }];
			}
		},
		buildCustom: function buildCustom(view) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			if (isViewClass(view)) {
				var childOptions = this.getOption('customViewOptions');
				view = new view(childOptions);
			} else if (_.isFunction(view)) {
				view = view.call(this, this);
			}
			if (isView(view)) {
				return [view, options];
			}
		},
		addChildViews: function addChildViews() {
			var children = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

			if (!children.length) {
				return;
			}

			var awaitingRender = false;

			while (children.length) {

				var args = children.pop();
				if (!args) {
					continue;
				}

				if (!_.isArray(args)) {
					args = [args, { index: 0 }];
				}

				var _args = args,
				    _args2 = slicedToArray(_args, 3),
				    view = _args2[0],
				    index = _args2[1],
				    _args2$ = _args2[2],
				    options = _args2$ === undefined ? {} : _args2$;

				if (_.isObject(index)) {
					options = index;
					index = undefined;
				}
				if (index != null && !('index' in options)) {
					options.index = index;
				}
				options.preventRender = !!children.length;
				if (!isView(view)) {
					continue;
				}

				this.addChildView(view, options);
				awaitingRender = options.preventRender;
			}
			if (awaitingRender) {
				this.sort();
			}
		}
	}, { CustomsMixin: true });
});



var index$6 = Object.freeze({
	emptyFetch: index$4,
	improvedIndexes: index$5,
	nextCollectionView: nextCollectionView,
	customs: customs$1
});

var defaultCssConfig = {
	beforeRender: true,
	modelChange: true,
	refresh: true
};

var cssClassModifiers = (function (Base) {
	return Base.extend({
		constructor: function constructor() {
			if (!this.cssClassModifiers) {
				this.cssClassModifiers = [];
			}
			Base.apply(this, arguments);
			this._setupCssClassModifiers();
		},
		addCssClassModifier: function addCssClassModifier(modifier) {
			this.cssClassModifiers.push(modifier);
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
	}, { CssClassModifiersMixin: true });
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

//import result from '../../../utils/better-result';
var index$7 = (function (Base) {
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
			var passedView = betterResult(context, 'view', { context: this, args: [this, this.model] });
			if (_.isFunction(context.template)) return context.template;else if (isView(passedView)) {
				return passedView;
			} else {
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

var index$8 = (function (BaseView) {
	return BaseView.extend({
		constructor: function constructor(options) {
			this.options = options;
			this.mergeOptions(options, ['managedCollection', 'collection', 'viewFilter', 'viewComparator', 'modelView', 'modelViewOptions', 'emptyView', 'emptyViewOptions']);

			BaseView.apply(this, arguments);

			//tries to initialize viewManager
			this._initializeViewManager();
		},


		template: _.noop,
		//if true - initializes ViewManager without collection support
		enableCustomViews: false,
		//if true - initializes ViewManager with collection and customviews support
		enableCollectionViews: false,

		_initializeViewManager: function _initializeViewManager() {
			var _this = this;

			var customs = this.getOption('enableCustomViews');
			var models = this.getOption('enableCollectionViews');
			if (!(customs || models)) return;

			var enableFilterForCustomViews = void 0;
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
				enableFilterForCustomViews: enableFilterForCustomViews
			});

			if (this._customViewsQueue) {
				_.each(this._customViewsQueue, function (args) {
					return _this._viewManager.addCustomView.apply(_this._viewManager, args);
				});
				this._customViewsQueue.length = 0;
				delete this._customViewsQueue;
			}
		},
		_fallbackOptions: function _fallbackOptions() {
			if (!this.modelView) {
				this.modelView = this.childView || this.options.childView;
			}
			if (!this.modelViewOptions) {
				this.modelViewOptions = this.childViewOptions || this.options.childViewOptions;
			}
		},


		/*
  	render has two additional calls
  		- this._viewManager.beforeRender()
  		- this._viewManager.processAndRender()
  */
		render: function render() {
			var template = this.getTemplate();

			if (template === false || this._isDestroyed) {
				return this;
			}

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
		getChildrenContainer: function getChildrenContainer() {
			return this.getOption('childrenContainer', { force: false });
		},


		/*
  	managing sort and filter
  */
		setComparator: function setComparator(comparator, opts) {
			this._viewManager && this._viewManager.setComparator(comparator, opts);
			this.viewComparator = comparator;
			return this;
		},
		getComparator: function getComparator() {
			return this.viewComparator;
		},
		setFilter: function setFilter(filter, opts) {
			this._viewManager && this._viewManager.setFilter(filter, opts);
			this.viewFilter = filter;
			return this;
		},
		getFilter: function getFilter() {
			return this.viewFilter;
		},


		/*
  	fallback methods for CollectionView 
  */
		sort: function sort() {
			this._viewManager && this._viewManager.processAndRender({ forceSort: true, forceFilter: true });
		},
		filter: function filter() {
			this._viewManager && this._viewManager.processAndRender({ forceFilter: true });
		},
		addChildView: function addChildView() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			if (!args || args.length == 0) return;
			if (this._viewManager) {
				this._viewManager.addCustomView.apply(this._viewManager, arguments);
			} else {
				this._customViewsQueue || (this._customViewsQueue = []);
				this._customViewsQueue.push(args);
			}
		}
	});
});

var destroy = (function (Base) {
	return Base.extend({
		destroy: function destroy() {
			if (this._isDestroyed || this._isDestroying) {
				return;
			}
			this._isDestroying = true;
			Base.prototype.destroy.apply(this, arguments);
			delete this._isDestroying;
		},
		isDestroyed: function isDestroyed() {
			return this._isDestroyed || this._isDestroying;
		}
	}, { DestroyMixin: true });
});

var index$9 = (function (Base) {
	return Base.extend({
		buildViewByKey: buildViewByKey
	});
});



var index$10 = Object.freeze({
	cssClassModifiers: cssClassModifiers,
	nestedViews: index$7,
	nextView: index$8,
	destroy: destroy,
	buildViewByKey: index$9
});

var TextView = Backbone$1.View.extend({
	constructor: function constructor() {
		var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
		    text = _ref.text;

		Backbone$1.View.apply(this, arguments);
		this.setText(text);
	},
	render: function render() {
		this.$el.html(this.text);
		this._isRendered = true;
		return this;
	},
	isRendered: function isRendered() {
		return this._isRendered === true;
	},
	setText: function setText(text) {
		this.text = text;
		if (this.isRendered()) {
			this.render();
		}
	}
});

var ViewMixin = (function (CollectionView) {
	var Mixed = CollectionView;
	var mixWith = [];

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
		var _mix;

		Mixed = (_mix = mix(Mixed)).with.apply(_mix, mixWith);
	}

	return Mixed.extend({
		viewComparator: false,
		wrapContent: true,
		childViewContainer: '[data-modal-content]',
		renderAllCustoms: true,
		templateContext: function templateContext() {
			return {
				shouldWrapContent: this.getOption('wrapContent') === true
			};
		},

		events: {
			'click': function click(event) {
				if (this.getOption('preventRemove')) {
					return;
				}
				var $el = $(event.target);
				event.stopPropagation();
				if ($el.closest('[data-modal-content]').length) {
					return;
				}
				this.destroy();
			}
		},
		customs: [function (v) {
			return v.createCloseButton();
		}, function (v) {
			return v.takeOptionsView('header');
		}, function (v) {
			return v.takeOptionsView('content');
		}, function (v) {
			return v.takeOptionsView('footer');
		}],
		createCloseButton: function createCloseButton() {
			if (!this.getOption('closeButton') || this.getOption('preventRemove')) {
				return;
			}
			var Button = this.getOption('closeButtonView');
			if (!isViewClass(Button)) {
				throw new Error('CloseButtonView not defined in modals config');
			}
			var view = new Button({ attributes: { 'data-modal-close': '' } });
			this.listenTo(view, 'click', this.destroy);
			return view;
		},
		takeOptionsView: function takeOptionsView(key) {
			var view = this.getOption(key);
			var _view = void 0;
			if (!view) {
				return view;
			} else if (isView(view)) {
				_view = view;
			} else if (_.isString(view)) {
				var tagName = ['header', 'footer'].indexOf(key) > -1 ? key : 'div';
				var View$$1 = this.getOption('textView') || TextView;
				_view = new View$$1({ text: view, tagName: tagName });
			} else if (isViewClass(view)) {
				var options = this.getOption(key + 'Options');
				_view = new view(options);
			}
			if (_view) {
				!this.modalChildren && (this.modalChildren = {});
				this.modalChildren[key] = _view;
				if (key === 'content') {
					this._initContentListeners(_view);
				}
				return _view;
			}
		},
		_initContentListeners: function _initContentListeners(content) {
			var _this = this;

			this.listenTo(content, {
				'destroy': function destroy$$1() {
					return _this.destroy();
				},
				'done': function done() {
					return _this.destroy();
				}
			});
		},

		attributes: {
			'data-modal': ''
		}
	});
});

var config$1 = {

	template: _.template('\n<div data-modal-bg></div>\n<% if(shouldWrapContent) {%><div data-modal-content-wrapper><%} %>\n<section data-modal-content></section>\n<% if(shouldWrapContent) {%></div><%} %>\n'),

	BaseView: undefined,
	TextView: undefined,
	ModalView: undefined,
	CloseButtonView: undefined,

	buildView: function buildView(options, View$$1) {
		if (!isViewClass(View$$1)) {
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
			template: this.template
		}, options);
		return new View$$1(options);
	},
	render: function render(view, stack) {
		var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

		var el = _.result(this, 'container');
		if (el && el.jquery) {
			el = el.get(0);
		}
		options = _.extend({
			el: el, replaceElement: true, destroyOnEmpty: true
		}, options);

		renderInNode(view, options);

		if (stack) {
			var _options = options,
			    preventRemove = _options.preventRemove;

			stack.add(view, { preventRemove: preventRemove });
		}
	},

	container: function container() {
		return document.querySelector('body');
	},
	stackOptions: {
		removeOnEsc: true,
		removeOnOutsideClick: true
	},
	getStack: function getStack(options) {
		if (!this.stack) {
			var stackOptions = this.stackOptions || options;
			this.stack = new ViewStack(stackOptions);
		}
		return this.stack;
	}
};

function show() {
	var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var showOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var preventRemove = opts.preventRemove,
	    promise = opts.promise;


	var modal = config$1.buildView(opts);
	showOptions.preventRemove = preventRemove;
	config$1.render(modal, config$1.getStack(), showOptions);

	if (promise) {
		return modal.promise;
	} else {
		return modal;
	}
}

var index$11 = {
	config: config$1,
	show: show
};



var index$12 = Object.freeze({
	historyWatcher: index$2,
	navigator: index$3,
	history: index$1,
	routeErrorHandler: errorHandler,
	Process: Process,
	Router: Router$1,
	Page: index,
	PageRouter: BaseRouter$2,
	BearerToken: Token,
	ViewManager: ViewManager,
	store: store,
	AppError: AppError,
	ViewStack: ViewStack,
	renderInNode: renderInNode,
	renderInNodeConfig: config,
	modals: index$11,
	TextView: TextView
});

function get$2(context, key) {
	if (_.isFunction(context.getOption)) {
		return context.getOption(key);
	} else {
		return getOption(context.options, key, { context: context, args: [context], checkAlso: context });
	}
}

function buildView(view, options) {
	if (isView(view)) {
		return view;
	} else if (isViewClass(view)) {
		return new view(options);
	}
}

function buildViewByKey(key) {
	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$allowTextView = _ref.allowTextView,
	    allowTextView = _ref$allowTextView === undefined ? true : _ref$allowTextView,
	    options = _ref.options;

	if (!_.isString(key)) {
		return;
	}
	var view = get$2(this, key);
	var _options = get$2(this, key + 'Options');
	if (allowTextView && _.isString(view)) {
		_options = _.extend(_options, { text: view });
		view = TextView;
	}
	options = _.extend({}, options, _options);
	return buildView(view, options);
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

var index$13 = Object.freeze({
	betterResult: betterResult,
	camelCase: camelCase,
	comparator: comparator,
	compareAB: compareAB,
	convertString: convertString,
	extend: extend,
	flat: flattenObject,
	getByPath: getByPath,
	getOption: getOption,
	hasFlag: hasFlag,
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
	isModel: isModel,
	isModelClass: isModelClass,
	isCollection: isCollection,
	isCollectionClass: isCollectionClass,
	isView: isView,
	isViewClass: isViewClass
});

// import result from '../../../utils/better-result';
// import getOption from '../../../utils/get-option';
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
				var option = betterResult(values, key, _.extend({ force: false }, opts));
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



var index$14 = Object.freeze({
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
	return _.isFunction(model.getPropertyDisplayConfig) && model.getPropertyDisplayConfig(key) || schema && schema.display || {};
}

//import getByPath from '../../../utils/get-by-path/index.js';
var index$15 = (function (Base) {
	var originalGet = Backbone$1.Model.prototype.get;
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
		},
		propertyName: function propertyName(key) {
			var prop = getPropertySchema(this, key);
			var display = getDisplayConfig(key, this, prop);
			return display.label || key;
		}
	});

	return Mixed;
});



var index$16 = Object.freeze({
	smartGet: index$15
});

var index$17 = (function (Collection$$1) {
	return Collection$$1.extend({
		constructor: function constructor() {

			this.on({
				request: function request() {
					this._isFetching = true;
				},
				sync: function sync() {
					this._isFetching = false;
					this._isFetched = true;
				}
			});

			Collection$$1.apply(this, arguments);
		},
		isFetching: function isFetching() {
			return this._isFetching === true;
		},
		isFetched: function isFetched() {
			return this._isFetched === true;
		}
	});
});



var index$18 = Object.freeze({
	isFetching: index$17
});

var index$19 = (function (Base) {
	return Base.extend({
		triggerNameEvent: true,
		stopEvent: true,
		constructor: function constructor(options) {
			Base.apply(this, arguments);
			this.mergeOptions(options, ['name']);
		},

		tagName: 'button',
		template: _.template('<i></i><span><%= text %></span><i></i>'),
		events: {
			'click': function click(e) {
				var _this = this;

				var stop = this.getOption('stopEvent');
				if (stop) {
					e.stopPropagation();
					e.preventDefault();
				}
				this.beforeClick().then(function (data) {
					_this.triggerMethod('click', data, e, _this);
					if (_this.name) {
						_this.triggerMethod('click:' + _this.name, data, e, _this);
					}
				}, function (error) {
					_this.triggerMethod('click:fail', error, _this.name, e, _this);
					if (_this.name) {
						_this.triggerMethod('click:' + _this.name + ':fail', error, e, _this);
					}
				});
			}
		},
		beforeClick: function beforeClick() {
			var result = this.triggerMethod('before:click');
			if (result && _.isFunction(result.then)) {
				return result;
			} else {
				return Promise.resolve(result);
			}
		},
		templateContext: function templateContext() {
			return {
				text: this.getOption('text')
			};
		},
		disable: function disable() {
			this.$el.prop('disabled', true);
		},
		enable: function enable() {
			this.$el.prop('disabled', false);
		}
	});
});

function takeValue(key) {
	var first = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var second = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	if (!_.isObject(first) || !_.isString(key)) return;
	if (key in first) {
		return first[key];
	} else {
		return second[key];
	}
}

function getTriggerMethod(context) {
	if (!context) {
		return function () {};
	}
	return _.isFunction(context.triggerMethod) ? context.triggerMethod : _.isFunction(context.trigger) ? context.trigger : function () {};
}

function ensureError(error, value) {
	if (error instanceof Error) {
		throw error;
	}
	return arguments.length > 1 ? value : error;
}

var ControlMixin = (function (Base) {
	return Base.extend({

		isControl: true,
		constructor: function constructor(options) {
			var _this = this;

			this._initControl(options);
			Base.apply(this, arguments);
			if (this.getOption('validateOnReady')) {
				this.once('control:ready', function () {
					_this.validate().catch(function () {});
				});
			}
		},
		_onControlDestroy: function _onControlDestroy() {
			var parent = this.getParentControl();
			if (parent && _.isFunction(parent._removeChildControl)) {
				parent._removeChildControl(this);
			}
			var children = this.getChildrenControls();
			if (children) {
				_.each(children, function (child) {
					return child._removeParentControl();
				});
				children.length = 0;
			}
			delete this._cntrl;
		},
		_removeChildControl: function _removeChildControl(control) {
			this.off(control);
			var children = this.getChildrenControls();
			if (!children.length) {
				return;
			}
			var index = children.indexOf(control);
			if (index === -1) return;
			children.splice(index, 1);
		},
		_addChildControl: function _addChildControl(control) {
			var children = this.getChildrenControls();
			children.push(control);
			// this.listenTo(control, 'control:invalid', (error) => {
			// 	this._onControlValidateFail(error, this.getControlValue({ notValidated: true })).catch(() => {});
			// });
		},
		_removeParentControl: function _removeParentControl() {
			delete this._cntrl.parent;
		},
		_initControl: function _initControl() {
			var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			if (this._controlInitialized) {
				return;
			}

			this._cntrl = {};
			var name = takeValue('controlName', options, this) || 'control';
			this._cntrl.name = name;

			var value = takeValue('value', options, this);
			value = this._clone(value);
			this.initControlValue(value);
			this.initParentControl(options);

			this.once('destroy', this._onControlDestroy);

			this._controlInitialized = true;
		},
		initParentControl: function initParentControl(options) {
			var parent = takeValue('proxyTo', options, this) || takeValue('parentControl', options, this);
			this._cntrl.parent = parent;
			if (parent && _.isFunction(parent._addChildControl)) {
				parent._addChildControl(this);
			}
		},
		initControlValue: function initControlValue(value) {
			this._cntrl.initial = value;
			this.setControlValue(value, { silent: true });
		},
		getControlName: function getControlName() {
			return this._cntrl.name;
		},
		isSameControlValue: function isSameControlValue(value) {
			var current = this.getControlValue();
			return this.isValid() && compareObjects(current, value);
		},
		getControlValue: function getControlValue(key) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


			if (_.isObject(key)) {
				options = key;
				key = undefined;
			}
			var _options = options,
			    notValidated = _options.notValidated,
			    clone = _options.clone;

			var valueKey = notValidated ? 'notValidated' : 'value';
			var value = this._cntrl[valueKey];
			if (key != null) {
				return getByPath(value, key);
			} else {
				return clone ? this._clone(value) : value;
			}
		},
		setControlValue: function setControlValue(value) {
			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			var key = options.key,
			    notValidated = options.notValidated;

			value = this._prepareValueBeforeSet(value, { key: key });
			var resolve = Promise.resolve(value);
			if (this.isSameControlValue(value)) {
				return resolve;
			}

			this._cntrl.notValidated = value;

			if (notValidated) {
				return resolve;
			}
			return this._setControlValue(value, options);
		},
		_prepareValueBeforeSet: function _prepareValueBeforeSet(value) {
			var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
			    key = _ref.key;

			value = this.prepareValueBeforeSet(value);
			if (key == null) {
				return value;
			}

			var current = this.getControlValue({ notValidated: true, clone: true }) || {};
			setByPath(current, key, value);
			return current;
		},


		//override this if you need modify value before set
		prepareValueBeforeSet: function prepareValueBeforeSet(value) {
			return value;
		},

		_setControlValue: function _setControlValue(value) {
			var _this2 = this;

			var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
			var skipValidation = options.skipValidation;

			if (skipValidation) {
				return this._onSetControlValueValidateSuccess(value, options);
			}
			return this._validate(value, options).then(function () {
				return _this2._onSetControlValueValidateSuccess(value, options);
			}, function (error) {
				return _this2._onSetControlValueValidateFail(error, value, options);
			});
		},
		_onSetControlValueValidateSuccess: function _onSetControlValueValidateSuccess(value, options) {
			this._cntrl.previous = this._cntrl.value;
			this._cntrl.value = value;
			this._cntrl.isDone = false;
			this._tryTriggerEvent('change', [value], options);
			return Promise.resolve(value);
		},
		_onSetControlValueValidateFail: function _onSetControlValueValidateFail(error, value, options) {
			this._tryTriggerEvent('change:fail', [value, error], options);
			return ensureError(error, value);
		},
		isValid: function isValid() {
			return this._cntrl.isValid !== false;
		},
		validate: function validate() {
			var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


			var notValidated = !this.isValid();
			var value = this.getControlValue({ notValidated: notValidated });
			var promise = this._validate(value, options);
			var _catch = options.catch;

			if (_catch === false) {
				return promise;
			} else if (_.isFunction(_catch)) {
				return promise.catch(_catch);
			} else {
				return promise.catch(ensureError);
			}
		},
		_validate: function _validate(value, options) {
			var _this3 = this;

			var validate = this._validateControlPromise(value, options);
			return validate.then(function () {
				return _this3._onControlValidateSuccess(value, options);
			}, function (error) {
				return _this3._onControlValidateFail(error, value, options);
			});
		},
		_validateChildrenControlsPromise: function _validateChildrenControlsPromise() {
			var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
			    isControlWrapper = _ref2.isControlWrapper,
			    skipChildValidate = _ref2.skipChildValidate;

			var errors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


			var children = this.getChildrenControls();
			var childrenPromise = Promise.resolve();
			if (!children.length) return childrenPromise;

			return _.reduce(children, function (finaly, child) {
				var control = child.getControlName();

				finaly = finaly.then(function () {

					if (!child.validate || skipChildValidate && control == skipChildValidate) {
						return Promise.resolve();
					}
					var validateResult = child.validate({ stopPropagation: true, catch: false });

					return validateResult;
				}).catch(function (error) {

					if (isControlWrapper) {
						errors.wrapped = error;
					} else {
						errors.children[control] = error;
					}
					return Promise.resolve();
				});
				return finaly;
			}, childrenPromise);
		},
		_validateControlPromise: function _validateControlPromise(value, options) {
			var _this4 = this;

			var skipChildValidate = options.skipChildValidate;

			var isControlWrapper = betterResult(this, 'isControlWrapper', { args: [this] });

			return new Promise(function (resolve, reject) {
				var childrenErrors = {
					children: {}
				};
				var childrenPromise = _this4._validateChildrenControlsPromise({ skipChildValidate: skipChildValidate, isControlWrapper: isControlWrapper }, childrenErrors);

				childrenPromise.then(function () {

					if (_.size(childrenErrors.children)) {
						reject(childrenErrors.children);
						return;
					} else if (childrenErrors.wrapped) {
						reject(childrenErrors.wrapped);
						return;
					}

					var validate = _this4.getOption('controlValidate', { force: false });
					var values = _this4.getParentControlValue({ notValidated: true });
					var validateResult = _.isFunction(validate) && validate.call(_this4, value, values, options) || undefined;
					var promise = Promise.resolve(value);
					if (validateResult && validateResult.then) {
						promise = validateResult;
					} else if (validateResult) {
						promise = Promise.reject(validateResult);
					}

					promise.then(function () {
						return resolve(value);
					}, function (error) {
						return reject(error);
					});
				});
			});
		},
		_onControlValidateSuccess: function _onControlValidateSuccess(value, options) {
			this.makeValid(value, options);
			return Promise.resolve(value);
		},
		makeValid: function makeValid(value, options) {
			this._cntrl.isValid = true;
			this._tryTriggerEvent('valid', [value], options);
		},
		_onControlValidateFail: function _onControlValidateFail(error, value, options) {
			this.makeInvalid(error, value, options);
			return Promise.reject(error);
		},
		makeInvalid: function makeInvalid(error, value, options) {
			this._cntrl.isValid = false;
			this._tryTriggerEvent('invalid', [value, error], options);
		},
		getParentControl: function getParentControl() {
			return this._cntrl.parent;
		},
		getParentControlValue: function getParentControlValue(options) {

			var parent = this.getParentControl();
			if (!parent || !_.isFunction(parent.getControlValue)) {
				return;
			}
			if (betterResult(parent, 'isControlWrapper', { args: [this] })) {
				return parent.getParentControlValue(options);
			} else {
				return parent.getControlValue(options);
			}
		},
		getChildrenControls: function getChildrenControls() {
			if (!this._cntrl.children) {
				this._cntrl.children = [];
			}
			return this._cntrl.children;
		},
		handleChildControlEvent: function handleChildControlEvent(event, controlName) {
			var childEvent = controlName + ':' + event;
			var trigger = getTriggerMethod(this);

			for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
				args[_key - 2] = arguments[_key];
			}

			trigger.call.apply(trigger, [this, childEvent].concat(toConsumableArray(args)));

			var cce = this.getOption('childControlEvents', { args: [this] }) || {};
			var def = this.defaultChildControlEvents || {};
			var handler = cce[childEvent];
			if (_.isFunction(handler)) {
				handler.apply(this, args);
			} else {
				var defHandler = def[event];
				_.isFunction(defHandler) && defHandler.call.apply(defHandler, [this, controlName].concat(toConsumableArray(args)));
			}
		},

		defaultChildControlEvents: {
			'change': function change(controlName, value) {
				var isControlWraper = this.getOption('isControlWrapper');
				isControlWraper && (controlName = undefined);
				this.setControlValue(value, { key: controlName, skipChildValidate: controlName });
			},
			'done': function done(controlName, value) {
				var isControlWraper = this.getOption('isControlWrapper');
				isControlWraper && (controlName = undefined);
				this.setControlValue(value, { key: controlName, skipChildValidate: controlName });
			},
			'invalid': function invalid(controlName, value, error) {
				var isControlWraper = this.getOption('isControlWrapper');
				isControlWraper && (controlName = undefined);
				this.setControlValue(value, { key: controlName, silent: true });
				this.makeInvalid(error);
			}
		},

		controlDone: function controlDone() {
			if (!this._cntrl.isValid || this._cntrl.isDone) {
				return;
			}
			var value = this.getControlValue();
			this._cntrl.isDone = true;
			this._tryTriggerEvent('done', [value]);
		},


		/*
  	helpers
  */
		_clone: function _clone(value) {
			if (_.isArray(value)) return value.slice(0);else if (_.isObject(value)) {
				return unFlat(flattenObject(value));
			} else return value;
		},
		_tryTriggerEvent: function _tryTriggerEvent(name) {
			var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

			var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
			    silent = _ref3.silent,
			    stopPropagation = _ref3.stopPropagation;

			if (silent) {
				return;
			}
			var controlName = this.getControlName();
			var event = 'control:' + name;
			var namedEvent = controlName + ':' + name;

			var trigger = getTriggerMethod(this);

			trigger.call.apply(trigger, [this, event].concat(toConsumableArray(args)));

			var parent = this.getParentControl();
			if (stopPropagation || !parent) {
				return;
			}
			if (_.isFunction(parent.handleChildControlEvent)) {
				parent.handleChildControlEvent.apply(parent, [name, controlName].concat(toConsumableArray(args)));
			} else {
				var parentTrigger = getTriggerMethod(parent);
				parentTrigger.call.apply(parentTrigger, [this, namedEvent].concat(toConsumableArray(args)));
			}
		},
		makeControlReady: function makeControlReady() {
			var trigger = getTriggerMethod(this);
			trigger.call(this, 'control:ready');
		}
	}, { ControlMixin: true });
});

var index$20 = (function (Base) {
	var Mixed = Base;
	if (!Mixed.ControlMixin) {
		Mixed = ControlMixin(Mixed);
	}
	if (!Mixed.CssClassModifiersMixin) {
		Mixed = cssClassModifiers(Mixed);
	}

	return Mixed.extend({
		renderAllCustoms: true,
		isControlWrapper: true,
		skipFirstValidationError: true,
		shouldShowError: false,

		constructor: function constructor() {
			Mixed.apply(this, arguments);
			if (!this.cssClassModifiers) {
				this.cssClassModifiers = [];
			}
			this.addCssClassModifier('control-wrapper');
			this.on({
				'control:valid': this._onControlValid,
				'control:invalid': this._onControlInvalid
			});
		},
		getCustoms: function getCustoms() {
			var customs = [];
			if (this.getOption('isControlWrapper')) {
				customs.push(this.getControlView());
			} else {
				var _customs;

				(_customs = customs).push.apply(_customs, toConsumableArray(this._customs));
			}
			customs = this.injectSystemViews(customs);
			return this._prepareCustoms(customs);
		},
		injectSystemViews: function injectSystemViews() {
			var customs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

			customs.unshift(this.getHeaderView());
			customs.push(this.getErrorView(), this.getFooterView());
			return customs;
		},
		bubildViewByKey: function bubildViewByKey(key) {
			var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
			    skipTextCheck = _ref.skipTextCheck,
			    options = _ref.options;

			var view = void 0;
			var value = void 0;

			if (!skipTextCheck) {
				value = this.getOption(key);
				if (_.isString(value)) {
					var tagName = key == 'header' || key == 'footer' ? key : 'div';
					view = this.buildTextView(value, tagName);
					if (view) {
						return view;
					}
				}
			}

			if (value == null) {
				view = this.getOption(key + 'View');
			} else {
				view = value;
			}

			if (isView(view)) {
				return view;
			}
			if (isViewClass(view)) {
				var _options = _.extend({}, this.getOption(key + 'ViewOptions'), options);
				return new view(_options);
			}
		},
		buildTextView: function buildTextView(text, tagName) {
			var View$$1 = this.getOption('textView');
			if (!View$$1) {
				return;
			}
			return new View$$1({ text: text, tagName: tagName });
		},
		getErrorView: function getErrorView() {
			if (!this.getOption('shouldShowError')) {
				return;
			}
			if (this.getOption('showValidateError', { force: false })) {
				return;
			}
			this.errorView = this.buildErrorView();
			return this.errorView;
		},
		buildErrorView: function buildErrorView() {
			return buildViewByKey.call(this, 'errorView', { allowTextView: false });
		},
		getHeaderView: function getHeaderView() {
			return this.buildHeaderView();
		},
		buildHeaderView: function buildHeaderView() {
			return buildViewByKey.call(this, 'header', { allowTextView: true, options: { tagName: 'header' } });
		},
		getFooterView: function getFooterView() {
			if (this.getOption('buttonsInFooter')) {
				return this.buildButtonsView();
			} else {
				return this.buildFooterView();
			}
		},
		buildFooterView: function buildFooterView() {
			return buildViewByKey.call(this, 'footer', { allowTextView: true, options: { tagName: 'footer' } });
		},
		buildButtonsView: function buildButtonsView() {
			if (this._buttonsView) {
				this.stopListening(this._buttonsView);
			}

			var options = this.buildButtonsOptions();
			var view = buildViewByKey.call(this, 'buttonsView', { allowTextView: false, options: options });
			if (!view) {
				return;
			}

			this._buttonsView = view;
			this.settleButtonsListeners(view);

			return view;
		},
		buildButtonsOptions: function buildButtonsOptions() {
			var _this = this;

			var btns = this.getOption('buttons');
			if (btns) {
				return _.reduce(btns, function (hash, b) {
					var item = _this.buildButton(b, _this);
					hash[item.name] = item;
					return hash;
				}, {});
			}
		},
		buildButton: function buildButton(value) {
			if (_.isString(value)) {
				return this.buildButton({ text: value, className: value, name: value });
			} else if (_.isFunction(value)) {
				return this.buildButton(value.call(this));
			} else if (_.isObject(value)) {
				return this.fixButton(value);
			}
		},
		fixButton: function fixButton(button) {
			return button;
		},
		settleButtonsListeners: function settleButtonsListeners(buttonsView) {
			this.listenTo(buttonsView, {
				'resolve': function resolve() {
					this.triggerMethod('resolve', this.getControlValue());
				},
				'reject': function reject() {
					this.triggerMethod('reject');
				},
				'reject:soft': function rejectSoft() {
					this.triggerMethod('reject:soft');
				},
				'reject:hard': function rejectHard() {
					this.triggerMethod('reject:hard');
				}
			});
		},
		getControlView: function getControlView() {
			this.control = buildViewByKey.call(this, 'controlView', { allowTextView: false, options: { parentControl: this } });
			return this.control;
		},
		_onControlInvalid: function _onControlInvalid(value, error) {
			this.disableButtons();
			this._showValidateError(error);
		},
		_onControlValid: function _onControlValid() {
			this.enableButtons();
			this._hideValidateError();
		},
		disableButtons: function disableButtons() {
			if (this._buttonsView && _.isFunction(this._buttonsView.disableButton)) {
				this._buttonsView.disableButton('resolve');
			}
		},
		enableButtons: function enableButtons() {
			if (this._buttonsView && _.isFunction(this._buttonsView.enableButton)) {
				this._buttonsView.enableButton('resolve');
			}
		},
		_showValidateError: function _showValidateError(error) {

			var shouldShow = this.getOption('shouldShowError');
			var skipFirstValidationError = this.getOption('skipFirstValidationError');

			if (skipFirstValidationError && !this._firstValidationErrorSkipped) {
				this._firstValidationErrorSkipped = true;
				return;
			}

			if (!shouldShow) return;

			var show = this.getOption('showValidateError', { force: false });
			if (_.isFunction(show)) {
				show.call(this, error);
			} else {
				if (!this.errorView) return;
				this.errorView.showError(error);
			}
		},
		_hideValidateError: function _hideValidateError() {
			var hide = this.getOption('hideValidateError', { force: false });
			if (_.isFunction(hide)) {
				hide.call(this);
			} else {
				if (!this.errorView) return;
				this.errorView.hideError();
			}
		}
	}, { ControlViewMixin: true });
});

//import getOption from '../../../utils/get-option';
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
	if (type == null) {
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
function setInputAttributes(inputView) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


	var attributes = getOption(inputView, opts, 'attributes');

	var check = _.extend({}, inputView, opts, inputView.valueOptions, opts.valueOptions);

	var restrictionKeys = {
		'maxLength': 'maxlength',
		'minLength': 'minlength',
		'minValue': 'min',
		'maxValue': 'max',
		'valuePattern': 'pattern',
		'required': 'required',
		'value': 'value'
	};
	var restrictions = {};
	_(restrictionKeys).each(function (key2, key) {
		var value = check[key];
		//getOption(inputView, opts, key);
		if (value != null) restrictions[key2] = value;
	});

	inputView.attributes = _.extend({
		value: inputView.value,
		type: getInputType(inputView, opts)
	}, restrictions, attributes);

	if (opts.attributes) delete opts.attributes;
}

//import getOption from '../../../../utils/get-option';
var getOption$1 = (function (context, key, ifNull) {
  return getOption(context, key, { args: [context], default: ifNull });
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


	if (event.keyCode == 13) {

		var shouldDone = getOption$1(context, 'doneOnEnter', true);
		if (shouldDone) {

			event.stopPropagation();
			event.preventDefault();
			context.controlDone();
		}
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
		context.controlDone();
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


	context.setControlValue(event.target.value).then(function (newvalue) {
		if (event.target.value != (newvalue || '').toString()) {
			input.value = newvalue;
		}
	});
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

//import camelCase from '../../../utils/camel-case';
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

//import getOption from '../../../utils/get-option';
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

// import getOption from '../../../utils/get-option';
// import convert from '../../../utils/convert-string';
var index$21 = (function (Base) {

	var Mixin = Base.ControlMixin ? Base : ControlMixin(Base);

	return Mixin.extend({
		constructor: function constructor(opts) {

			this._initControl(opts);

			setInputAttributes(this, opts);
			setInputEvents(this, opts);
			Mixin.apply(this, arguments);

			if (!_.isFunction(this.getOption)) {
				this.getOption = _.partial(getOption, this, _, { args: [this] });
			}

			this.buildRestrictions();
			var value = this.getOption('value') || '';
			this.el.value = value;
			//this.setControlValue(value, { trigger: false, silent: true });
		},

		tagName: 'input',
		template: false,
		doneOnEnter: true,
		doneOnBlur: true,
		buildRestrictions: function buildRestrictions() {
			var attrs = _.result(this, 'attributes');
			var pickNumbers = ['maxlength', 'minlength', 'min', 'max'];
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
		controlValidate: function controlValidate(value) {
			if (value == null || value === '') {
				if (this.restrictions.required) return 'required';else if (this.restrictions.minLength > 0) {
					return 'length:small';
				} else return;
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

//import View from 'base/collection-view';
//import Button from 'components/button';
var index$22 = (function (Base) {
	return Base.extend({
		constructor: function constructor(options) {
			if (!this.cssClassModifiers) {
				this.cssClassModifiers = [];
			}
			this._buttons = {};
			Base.apply(this, arguments);
			this.addPromiseBarCssClass();
			this.mergeOptions(options, ['promise', 'reject', 'resolve', 'beforeRejectSoft', 'beforeRejectHard', 'beforeResolve']);
		},

		className: 'promise-bar',
		tagName: 'footer',
		resolve: 'ok',
		triggerNameEvent: true,
		addPromiseBarCssClass: function addPromiseBarCssClass() {
			this.cssClassModifiers.push('promise-bar');
		},
		onRender: function onRender() {
			this.addButtons();
		},
		addButtons: function addButtons() {
			var buttons = this.buildButtons() || [];
			while (buttons.length) {
				var button = buttons.pop();
				var preventRender = !!buttons.length;
				this.addChildView(button, { preventRender: preventRender });
			}
		},
		buildButtons: function buildButtons() {
			var _this = this;

			var names = ['resolve', 'rejectSoft', 'rejectHard'];
			return _.reduce(names, function (buttons, name) {
				var button = _this.buildButton(name);
				button && buttons.push(button);
				return buttons;
			}, []);
		},
		buildButton: function buildButton(name) {
			var options = this.getButtonOptions(name);
			if (!options) return;
			var Button = this.getOption('buttonView');
			var btn = new Button(options);
			this._buttons[name] = btn;
			return btn;
		},
		getButtonOptions: function getButtonOptions(name) {
			var options = this.getOption(name);
			if (!options) return;
			if (_.isString(options)) {
				options = { text: options };
			} else if (!_.isObject(options)) {
				return;
			}
			var defs = {
				className: name,
				name: name,
				triggerNameEvent: this.getOption('triggerNameEvent'),
				stopEvent: true
			};
			options = _.extend(defs, options);
			return options;
		},

		childViewEvents: {
			'click:resolve': function clickResolve(data) {
				this.triggerMethod('resolve', data);
			},
			'click:rejectSoft': function clickRejectSoft(value) {
				this.triggerMethod('reject', { type: 'soft', value: value });
				this.triggerMethod('reject:soft', value);
			},
			'click:rejectHard': function clickRejectHard(value) {
				this.triggerMethod('reject', { type: 'hard', value: value });
				this.triggerMethod('reject:hard', value);
			},
			'click:fail': function clickFail(error, name, event, view) {
				this.triggerMethod('click:fail', error, name, event, view);
				if (name) {
					this.triggerMethod('click:' + name + ':fail', error, event, view);
				}
			}
		},

		disableButton: function disableButton(name) {
			var btn = this._buttons[name];
			btn && btn.disable();
		},
		enableButton: function enableButton(name) {
			var btn = this._buttons[name];
			btn && btn.enable();
		}
	});
});



var index$23 = Object.freeze({
	button: index$19,
	control: ControlMixin,
	controlView: index$20,
	input: index$21,
	promiseBar: index$22
});



var index$24 = Object.freeze({
	common: index$14,
	model: index$16,
	collection: index$18,
	view: index$10,
	collectionView: index$6,
	controls: index$23
});

exports.mixins = index$24;
exports.components = index$12;
exports.utils = index$13;

return exports;

}({},Backbone,Mn));

//# sourceMappingURL=index.js.map
