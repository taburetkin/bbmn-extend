import camelCase from '../camel-case';
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
	if(typeof value != typeof flag)
		throw new Error('value and flag must be of same type. allowed types: string, number');


	if(_.isNumber(value) && _.isNumber(flag)) {
		let has = value & flag;
		return opts.all === true ? has === flag : has > 0;
	}

	if(_.isString(value) && _.isString(flag)) {
		if(value === '' || flag === '') return false;
		let values = transformStringArray(value.split(/\s*,\s*/), opts);
		let flags = transformStringArray(flag.split(/\s*,\s*/), opts);
		let intersection = _.intersection(values, flags);
		
		if(intersection.length == 0) return false;

		if(intersection.length == flags.length) return true;

		return opts.all != true;

	}

}
