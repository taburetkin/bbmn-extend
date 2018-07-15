import executingProcessFlagKey from './process-flag-key';

export default function processConcurrencyCheck(processContext){

	let executingKey = executingProcessFlagKey(processContext.name);
	let previous = processContext.context[executingKey];
	if(!previous) return;

	let concurrent = processContext.concurrent;	
	
	if (concurrent === false) {

		processContext.cancel();

	} else if (concurrent == 'first') {

		return previous.promise;

	} else if (concurrent == 'last') {

		previous.cancelation.cancel();

	}		
}
