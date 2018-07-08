import setByPathArray from './set-by-path-array';
import isModel from '../../bb/is-model';

export default function setByPath(context, path, value, opts) {


	if (context == null || !_.isObject(context) || path == null || path == '') return value;

	let options = _.extend({}, opts);
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

	var pathArray = _.isString(path) ? path.split('.')
		: _.isArray(path) ? [].slice.call(path)
			: [path];

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

	let result = setByPathArray(context, prop, pathArray, value, options);

	if (result === undefined && value !== undefined) {

		return value;
	}

	//triggering change event on all met models
	if (!options.silent) {
		let originPath = options.pathArray.join(':');
		while (options.models.length) {
			let modelContext = options.models.pop();
			let propertyEventName = modelContext.path == ''
				? originPath
				: originPath.substring(modelContext.path.length + 1);

			if (propertyEventName) {
				modelContext.model.trigger('change:' + propertyEventName, value);
			}
			modelContext.model.trigger('change', modelContext.model);
		}
	}


	return result;
}


