import camelCase from '../../utils/camel-case';
import result from '../../utils/better-result';
import triggerMethodOn from '../../mn/trigger-method-on';

export function invokeOnContext(processContext, methodName)
{
	let method = camelCase(methodName);
	let context = processContext.context;
	let args = processContext.args;
	return result(context, method, { args });
}

export function triggerOnContext (processContext, eventName, ...args) {
	
	let context = processContext.context; 
	if(!_.isFunction(context.trigger))
		return;
	
	let event = processContext.name + (eventName ? ':' + eventName : '');
	
	(!args || !args.length) && (args = processContext.args || []);

	triggerMethodOn(context, event, ...args);

}
