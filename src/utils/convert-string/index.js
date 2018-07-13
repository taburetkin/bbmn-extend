import toNumber from './to-number';
import toBoolean from './to-boolean';


//this is under development yet and can be change in any time
export default function convertString(text, type, opts) {

	switch(type){
	case 'number':
		return toNumber(text, opts);
	case 'boolean':
		return toBoolean(text, opts);
	default:
		return text;
	}


}
