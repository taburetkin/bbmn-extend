import setByPathArray from './set-by-path-array.js';
import normalizeOptions from './normalize-options.js';
import triggerModelChangeEvents from './trigger-model-change-events.js';
import ensureArguments from './ensure-arguments.js';
export default function setByPath(context, path, value, opts = {}) {

	let argumentsErrors = ensureArguments(context, path);
	if (argumentsErrors) {
		return value;
	}

	let pathArray = path.split('.');	
	let options = normalizeOptions(opts, { path, pathArray: [].slice.call(pathArray) });

	let propertyName = pathArray.shift();

	let result = setByPathArray(context, propertyName, pathArray, value, options);

	if (result === undefined && value !== undefined) {
		return value;
	}

	triggerModelChangeEvents(value, options);

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


