import getProperty from '../get-by-path/get-property';
import isModel from '../../bb/is-model';
function setProperty(context, name, value, options) {
	if (isModel(context)) {
		context.set(name, value, { silent: true });
	}
	else {
		context[name] = value;
	}

	if(isModel(value)){
		options.models.push({
			path: options.passPath.join(':'),
			property: name,
			model: value
		});		
	}

	options.passPath.push(name);

	return getProperty(context, name);
}

export default setProperty;
