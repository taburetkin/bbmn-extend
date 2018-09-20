import getProperty from '../get-by-path/get-property.js';
import { isModel } from '../../vendors/helpers.js';
function setProperty(context, name, value) {
	if (isModel(context)) {
		context.set(name, value, { silent: true });
	}
	else {
		context[name] = value;
	}

	return getProperty(context, name);
}

export default setProperty;
