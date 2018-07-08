import getProperty from '../get-by-path/get-property';
import setProperty from './set-property';

export default function setByPathArr(context, propertyName, pathArray, value, options) {

	if (context == null || !_.isObject(context) || propertyName == null || propertyName == '') {
		return;
	}
	

	if (!pathArray.length) {
		return setProperty(context, propertyName, value, options);
	}

	var prop = getProperty(context, propertyName);

	if (!_.isObject(prop) && !options.force) {
		return;
	} else if (!_.isObject(prop) && options.force) {
		prop = setProperty(context, propertyName, {}, options);
	}

	var nextName = pathArray.shift();

	return setByPathArr(prop, nextName, pathArray, value, options);
}
