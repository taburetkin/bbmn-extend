
function isEmpty(arg) {
	return arg == null || arg === '' || arg.toString().trim() === '';
}




export default [
	{
		name: 'required',
		message: 'required',
		validate: (value) => !isEmpty(value)
	},
	{
		name: 'email',
		message: 'not a email',
		validate: (value) => {
			if(isEmpty(value)) {
				return true;
			}
			if (!_.isString(value)) {
				return false;
			}

			let chunks = value.split('@');
			let left = chunks[0];
			let right = chunks[1];
		
			if(
				chunks.length != 2
				|| !/^[a-z0-9\-_.+]+$/gmi.test(left)
				|| !/^[a-z0-9\-_]+\.[a-z0-9\-_]+(\.[a-z0-9\-_]+)*$/gmi.test(right)
			) {
				return false;
			} else {
				return true;
			}
		}
	},
	{
		name:'valueIn',
		message: 'given value is not allowed',
		validate: (value, { valueIn } = {}) => {
			if(_.isArray(valueIn)) {
				return valueIn.indexOf(value) > -1;
			}
		}
	},
	{
		name:'valueNotIn',
		message: 'given value is forbiden',
		validate: (value, { valueNotIn } = {}) => {
			if(_.isArray(valueNotIn)) {
				return valueNotIn.indexOf(value) === -1;
			}
		}
	},
	{
		name:'shouldBeEqual',
		message: 'given value is not equal',
		validate: (value, { shouldBeEqual, allValues } = {}) => {
			if(_.isFunction(shouldBeEqual)) {
				return value === shouldBeEqual(allValues);
			} else {
				return value === shouldBeEqual;
			}
		}
	},	
	{
		name:'shouldNotBeEqual',
		message: 'given value is forbiden',
		validate: (value, { shouldNotBeEqual, allValues } = {}) => {
			if(_.isFunction(shouldNotBeEqual)) {
				return value !== shouldNotBeEqual(allValues);
			} else {
				return value !== shouldNotBeEqual;
			}
		}
	},
	{
		name:'minLength',
		message: 'length is less than',
		validate: (value, { minLength } = {}) => {
			if (_.isNumber(minLength)) {
				return (value || '').toString().length >= minLength;
			}
		}
	},
	{
		name:'maxLength',
		message: 'length is greater than',
		validate: (value, { maxLength } = {}) => {
			if (_.isNumber(maxLength)) {
				return (value || '').toString().length <= maxLength;
			}
		}
	},
	{
		name:'minValue',
		message: 'value is less than',
		validate: (value, { minValue } = {}) => {
			if (minValue != null) {
				return value >= minValue;
			}
		}
	},
	{
		name:'maxValue',
		message: 'value is greater than',
		validate: (value, { maxValue } = {}) => {
			if (maxValue !=null) {
				return value <= maxValue;
			}
		}
	},
	{
		name:'pattern',
		message: 'value is not in pattern',
		validate: (value, { pattern } = {}) => {
			value = (value || '').toString();
			if (isEmpty(pattern) && !_.isString(pattern) && !_.isRegExp(pattern)) {
				return;
			}
			if (_.isString(pattern)) {
				pattern = new RegExp(pattern);
			}
			return pattern.test(value);
		}
	},
];
