import isEmptyValue from '../is-empty-value/index.js';

function normalizeStringArray(arr){
	return _.reduce(arr, (result,item) => {
		if(item == null) return;
		result.push(item.toString());
		return result;
	}, []);
}

function compare(a, b, options = {}){
	if (a == null) {
		return false;
	}
	let { caseInsensitive = true } = options;
	if (!_.isString(a)) {
		a = a.toString();
	}
	if(caseInsensitive) {
		a = a.toLowerCase();
		b = b.toLowerCase();
	}
	return a === b;
}

export default function getFlag(value, flag, options = {}){
	let flags;
	if (isEmptyValue(value) || isEmptyValue(flag)) { return; }	
	let { returnAs, useObjectValues, takeObjectKeys, all, delimeter = ', ', doNotPluck } = options;
	if(_.isString(flag)){
		flags = normalizeStringArray(flag.split(/\s*,\s*/gmi), options);
	}else if(_.isArray(flag)) {
		flags = normalizeStringArray(flag, options);
	} else {
		return;
	}
	if (returnAs == null) {
		returnAs = _.isArray(flag) ? 'array' : 'string';
	}
	if(_.isString(value)) {
		value = normalizeStringArray(value.split(/\s*,\s*/gmi), options);
	}
	let isArray = _.isArray(value);
	let method = all ? 'every' : 'some';
	let founded = _.reduce(value, (filtered, item, key) => {
		let check = item;
		if(!isArray && !useObjectValues){
			check = key;
		}
		
		let good = _[method](flags, flag => compare(check, flag, options));
		//console.log(method, good, flags, value);
		if (!good) { return filtered; }

		if (isArray) {
			filtered.push(check);
		} else {
			filtered.push({value: item, key });
		}
		return filtered;
	}, []);

	//console.log(founded);
	if (returnAs === 'string') {
		if (isArray) {
			return founded.join(delimeter);
		} else {
			let key = takeObjectKeys ? 'key' : 'value';
			return _.pluck(founded, key).join(delimeter);
		}
	} else if(returnAs === 'array'){
		if (isArray || doNotPluck) {
			return founded;
		} else {
			let key = takeObjectKeys ? 'key' : 'value';
			return _.pluck(founded, key);
		}
	} else if(returnAs === 'object') {
		return _.reduce(founded, (result, item, index) => {
			let value = isArray 
				? item 
				: takeObjectKeys ? item.key : item.value;
			let key = isArray 
				? index 
				: takeObjectKeys ? item.value : item.key;
			result[key] = value;
			return result;
		}, {});
	}

}
