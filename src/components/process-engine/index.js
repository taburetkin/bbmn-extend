//import engine from './engine';
import createProcessContext from './process-context';
import concurrencyCheck from './concurrency-check';
import beginProcess from './begin-process';

export default function initializeProcess(context, name, opts){

	context[name] = function(...args){
		
		let processContext = createProcessContext(context, name, args, opts);
			
		let concurrent = concurrencyCheck(processContext);
		if (concurrent) {
			return concurrent;
		} else {
			return beginProcess(processContext);
		}

	};

}
