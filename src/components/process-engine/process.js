import { triggerBegin, triggerBefore, triggerComplete, triggerError } from './triggers';
import { getCanNotRunPromise, getWaitPromise } from './run-promises';


export default function process(processContext){
	
	let promise = new Promise((resolve, reject) => {
		let shouldExit = false;
		let rejectWithError = (error) => {			
			triggerError(processContext, error);
			reject(processContext);
			shouldExit = true;
		};

		Promise.race([
			processContext.cancelation.promise, 
			Promise.resolve()
		]).catch(rejectWithError);

		if(shouldExit) return;

		let beginError = triggerBegin(processContext);
		if (beginError) {
			rejectWithError(beginError);
			return;
		}

		let canBeRuned = getCanNotRunPromise(processContext);
		canBeRuned.then(
			() => {
				triggerBefore(processContext);
				let waitFor = getWaitPromise(processContext);
				return waitFor.then(
					() => {
						triggerComplete(processContext);
						resolve();
					}
				);
			}
		).catch(rejectWithError);

	});
	processContext.promise = promise.catch((context) => {		
		let error;
		if(context instanceof Error) {
			triggerError(processContext, context);
			throw context;
		}
		if(context && context.errors && context.errors.length == 1 && context.errors[0] instanceof Error) {
			error = context.errors[0];
			return Promise.reject(error);
		}


		if(processContext.shouldCatch)
			return context;
		else
			return Promise.reject(context);

	});
	return promise;
}
