import executingProcessFlagKey from './process-flag-key';
import { triggerOnContext } from './invoke-on-context';

export function triggerBegin(processContext) { 

	let key = executingProcessFlagKey(processContext.name);
	processContext.context[key] = processContext;

	triggerOnContext(processContext, 'begin');

}
export function triggerBefore(processContext) { 

	triggerOnContext(processContext, 'before');

}
export function triggerComplete(processContext) { 

	triggerOnContext(processContext, 'complete');
	triggerOnContext(processContext, 'end');

}
export function triggerError(context, errors){ 

	if(!_.isArray(errors))
		errors = [errors];

	context.errors.push(...errors);

	triggerOnContext(context, 'error', ...context.errors);
	triggerOnContext(context, 'end');
	
}
