import defaultOptions from './options.js';

const trueValues = ['true','1','-1','yes'];
const falseValues = ['false','0','no'];

const alternative = function(...args) {
	let returnValue;
	_(args).some(arg => {
		if(_.isBoolean(arg)) {
			returnValue = arg;
			return true;
		}
	});
	return returnValue;
};

const valueOrAlternative = function(nullable, nullValue, value, ...alts){
	let alt = alternative(...alts);
	if (alt != null)
		return alt;
	else if (nullable)
		return nullValue;
	else
		return value;
};

const convertToBoolean = function (arg, opts = {})
{

	let other;
	let options = _.extend({}, defaultOptions, opts);
	let { 
		nullable, strict,
		returnNullAs, returnEmptyAs, returnNullAndEmptyAs,
		returnAnyAs, returnOtherAs
	} = options;



	if (arg == null) {
		return valueOrAlternative(nullable, undefined, false, returnNullAs, returnNullAndEmptyAs);
	}
	else if (arg === '') {
		return valueOrAlternative(nullable, undefined, false, returnEmptyAs, returnNullAndEmptyAs);
	} else if (_.isBoolean(arg)) {
		return arg;
	}
	//  else if (_.isObject(arg)) {
	// }
	
	other = strict 
		? (nullable ? undefined : false) 
		: true;
		

	let text = arg.toString().toLowerCase();
	let isTrue = convertToBoolean.trueValues.indexOf(text) > -1;
	let isFalse = convertToBoolean.falseValues.indexOf(text) > -1;


	if (_.isBoolean(returnAnyAs)) {
		return returnAnyAs;
	} else if (_.isBoolean(returnOtherAs)) {
		other = returnOtherAs;
	}
	
	return isTrue 
		? true 
		: isFalse 
			? false 
			: other;
};

convertToBoolean.trueValues = trueValues;
convertToBoolean.falseValues = falseValues;
export default convertToBoolean;
