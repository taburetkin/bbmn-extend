import result from '../better-result/index.js';

export default function getOption(context = {}, key, opts, also) {

	if(_.isObject(key) && _.isString(opts)){
		let _opts = also;
		also = key;
		key = opts;
		opts = _opts;
	}

	let options = _.extend({ args:[context], context }, opts, { default: null });
	let { deep } = options;
	let defaultValue = opts && opts.default;

	let value = result(context.options || also, key, options);
	if (value == null && deep !== false) {
		value = result(context, key, options);
	}
	
	return value != null ? value : defaultValue;

}

export function instanceGetOption(...args){
	return getOption(this, ...args);
}
