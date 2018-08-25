import getProperty from '../get-by-path/get-property';
import setProperty from './set-property';
import ensureArguments from './ensure-arguments';
import { isModel } from '../../vendors/helpers';
export default function setByPathArr(context, propertyName, pathArray, value, options) {

	let argumentsErrors = ensureArguments(context, propertyName);
	if (argumentsErrors) {
		return;
	}

	let modelContext;
	if (isModel(context)) {
		modelContext = {
			model: context,
			property: propertyName,
			pathChunks: [].slice.call(pathArray)
		};
	}

	//set value if this is a last chunk of path
	if (!pathArray.length) {

		modelContext && options.models.push(modelContext);

		return setProperty(context, propertyName, value, options);

	} else {

		var prop = getProperty(context, propertyName);

		if (!_.isObject(prop) && !options.force) {
			return;
		} else if (!_.isObject(prop) && options.force) {
			prop = setProperty(context, propertyName, {}, options);
		} 

		modelContext && options.models.push(modelContext);

		var nextName = pathArray.shift();	
		return setByPathArr(prop, nextName, pathArray, value, options);

	}
}
