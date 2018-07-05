import isKnownCtor from '../is-known-ctor';

export default function getProperty(valueContext, key, options = {}, fallback){

	let context = options.context || valueContext;
	options.deep !== undefined || (options.deep = true);
	options.force !== undefined || (options.force = true);
	options.args || (options.args = []);

	//key and valueContext should be passed
	if(key == null) return;
	
	//getting raw value
	let value = valueContext && valueContext[key];

	//if there is no raw value and deep option is true then getting value from fallback
	if(value === undefined && options.deep && _.isFunction(fallback)){
		let fallbackOptions = _.extend({}, options, {deep:false, force: false});
		value = fallback.call(context, key, fallbackOptions); 
	}

	//if returned value is function and is not any of known constructors and options property force set to true 
	//we should return value of that function
	//options.args will be passed as arguments
	if(_.isFunction(value) && options.force && !isKnownCtor(value))
		value = value.apply(context, options.args || []);

	//console.log('key', key, value);
	
	//if value is still undefined we will return default option value
	return value === undefined ? options.default : value;
}

