
import getProperty from './get-property.js';

function getByPathArray(context, propertyName, pathArray) {
	
	if (context == null || !_.isObject(context) || propertyName == null || propertyName == '')
		return;

	var prop = getProperty(context, propertyName);

	if (!pathArray.length || (pathArray.length && prop == null))
		return prop;

	var nextName = pathArray.shift();

	return getByPathArray(prop, nextName, pathArray);

}

export default getByPathArray;
