export default function isEmptyValue(arg, { allowWhiteSpace = false } = {}) {
	if (arg == null || _.isNaN(arg)) return true;
	if (!_.isString(arg)) return false;
	if (arg === '') return true;
	
	return !allowWhiteSpace && arg.trim() === '';
	
}
