import getProperty from '../get-by-path/get-property';
import isModel from '../../bb/is-model';
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
