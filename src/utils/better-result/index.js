import isKnownCtor from '../is-known-ctor';
export default function betterResult(obj, key, opts = {})
{
	let { context, args, checkAlso } = opts;
	let defaultValue = opts.default;

	if(!_.isString(key) || key === '') return;
	
	let value = (obj || {})[key];

	if (value != null && (!_.isFunction(value) || isKnownCtor(value)))
		return value;
		
	let result = _.isFunction(value) && value.apply(context || obj, args);

	if (result == null && _.isObject(checkAlso)) {
		let alsoOptions = _.omit(opts, 'checkAlso');
		result = betterResult(checkAlso, key, alsoOptions);
	}

	if (result == null && defaultValue != null )
		result = defaultValue;

	return result;
}
