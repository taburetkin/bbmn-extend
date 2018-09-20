
import camelCase from '../camel-case/index.js';
import getOption from '../get-option/index.js';

export default function triggerMethod(event, ...args) {
	// get the method name from the event name
	const methodName = camelCase('on:' + event);
	const method = getOption(this, methodName, { force: false });
	let result;
  
	// call the onMethodName if it exists
	if (_.isFunction(method)) {
		// pass all args, except the event name
		result = method.apply(this, args);
	}
  
	if(_.isFunction(this.trigger)) {
		// trigger the event
		this.trigger.apply(this, arguments);
	}
  
	return result;
}


