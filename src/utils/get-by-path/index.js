import getByPathArray from './get-by-path-array.js';

export default function getByPath(obj, path) {

	if (obj == null || !_.isObject(obj) || path == null || path == '') return;

	var pathArray = _.isString(path) ? path.split('.')
		: _.isArray(path) ? [].slice.call(path)
			: [path];

	var prop = pathArray.shift();

	return getByPathArray(obj, prop, pathArray);

}
