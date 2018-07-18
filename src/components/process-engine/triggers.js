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

	triggerOnContext(processContext);
	if (_.isFunction(processContext.onComplete))
		processContext.onComplete.call(processContext.context, ...processContext.args);
	triggerOnContext(processContext, 'end');

}
export function triggerError(processContext, errors){ 

	if(!_.isArray(errors))
		errors = [errors];

	processContext.errors.push(...errors);

	triggerOnContext(processContext, 'error', ...processContext.errors);
	if (_.isFunction(processContext.onError))
		processContext.onError.call(processContext.context, ...processContext.errors);

	triggerOnContext(processContext, 'end');
	
}
