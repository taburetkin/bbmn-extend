const trueValues = ['true','1','-1','yes'];
const falseValues = ['false','0','no'];

const convertToBoolean = function (arg, opts = {})
{
	if (arg == null) {
		if (_.isBoolean(opts.returnNullAs))
			return opts.returnNullAs;
		else if(_.isBoolean(opts.returnNullAndEmptyAs))
			return opts.returnNullAndEmptyAs;
		else
			return opts.nullable ? arg : false;
	}
	if (arg === '') {
		if (_.isBoolean(opts.returnEmptyAs))
			return opts.returnEmptyAs;
		else if(_.isBoolean(opts.returnNullAndEmptyAs))
			return opts.returnNullAndEmptyAs;
		else
			return opts.nullable ? arg : false;
	}
	
	let text = arg.toString().toLowerCase();
	let isTrue = convertToBoolean.trueValues.indexOf(text) > -1;
	let isFalse = convertToBoolean.falseValues.indexOf(text) > -1;
	let other = !opts.nullable ? false : undefined;
	if (_.isBoolean(opts.returnAnyAs)) {
		return opts.returnAnyAs;
	} else if (_.isBoolean(opts.returnOtherAs)) {
		other = opts.returnOtherAs;
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
