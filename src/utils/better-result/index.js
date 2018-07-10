import isKnownCtor from '../is-known-ctor';
export default function betterResult(obj, key, opts = {})
{
	let { force, context, args } = opts;
	let defaultValue = opts.default;
	if(!_.isObject(obj) || !_.isString(key) || key === '') return;
	let value = obj[key];
	if(force === false || !_.isFunction(value) || isKnownCtor(value))
		return value;
	
	!context && (context = obj);
	let result = value.apply(context, args);
	if (result == null && defaultValue != null )
		result = defaultValue;

	return result;
}