import executingProcessFlagKey from './process-flag-key';
import { triggerOnContext } from './invoke-on-context';

export function triggerBegin(processContext) { 


	let beginError = _.isFunction(processContext.onBegin) && processContext.onBegin.call(processContext.context, ...processContext.args);
	if (beginError)
		return beginError;

	let key = executingProcessFlagKey(processContext.name);
	processContext.context[key] = processContext;
	triggerOnContext(processContext, 'begin');

}
export function triggerBefore(processContext) { 

	triggerOnContext(processContext, 'before');

}
export function triggerComplete(processContext) { 

	triggerOnContext(processContext, 'complete');
	if (_.isFunction(processContext.onComplete))
		processContext.onComplete.call(processContext.context, ...processContext.args);
	triggerOnContext(processContext, 'end');

}
export function triggerError(context, errors){ 

	if(!_.isArray(errors))
		errors = [errors];

	context.errors.push(...errors);

	triggerOnContext(context, 'error', ...context.errors);
	if (_.isFunction(context.onError))
		context.onError.call(context.context, ...context.errors);

	triggerOnContext(context, 'end');
	
}
