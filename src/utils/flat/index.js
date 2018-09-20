import traverse from './traverse.js';

export default function flattenObject(obj) {
	if (obj == null || !_.isObject(obj)) return;
	var res = {};
	traverse.call(obj, res);
	return res;
}
