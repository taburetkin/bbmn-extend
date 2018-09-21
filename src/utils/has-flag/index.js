import camelCase from '../camel-case/index.js';
function transformStringArray(arr, opts = {}){
	let { ignoreCase = true, toCamelCase = false } = opts;
	return _(arr).map(value => {
		if (ignoreCase) 
			return value.toLowerCase();
		else if (toCamelCase)
			return camelCase(value);
		else
			return value;
	});
}
export default function hasFlag(value, flag, opts = {}){
	if (value == null || flag == null) return false;

	// if(typeof value != typeof flag)
	// 	throw new Error('value and flag must be of same type. allowed types: string, number');


	if (_.isNumber(value) && _.isNumber(flag)) {
		let has = value & flag;
		return opts.all === true ? has === flag : has > 0;
	} else if ((_.isNumber(value) && !_.isNumber(flag)) || (!_.isNumber(value) && _.isNumber(flag))) {
		return false;
	}

	if (!_.isArray(flag)) { flag = flag.toString(); }
	if (!_.isString(flag) && !_.isArray(flag)) { return false; }

	let rawflags = _.isArray(flag) 
		? flag
		: flag.split(/\s*,\s*/);


	let rawvalues;
	if(_.isString(value)){
		rawvalues = value.split(/\s*,\s*/);
	} else if(_.isArray(value)){
		rawvalues = values;
	} else if(_.isObject(value)) {
		rawvalues = opts.useObjectValues 
			? _.map(value, v => v)
			: _.keys(value);
	} else {
		return false;
	}

	let flags = transformStringArray(rawflags, opts);
	let values = transformStringArray(rawvalues, opts);

	let intersection = _.intersection(values, flags);		
	if (intersection.length == 0) return false;
	if (intersection.length == flags.length) return true;
	return opts.all != true;


	// if(_.isString(value) && _.isString(flag)) {
	// 	if(value === '' || flag === '') return false;
	// 	let values = transformStringArray(value.split(/\s*,\s*/), opts);
	// 	let flags = transformStringArray(flag.split(/\s*,\s*/), opts);

	// }

}
