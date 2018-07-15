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
	processContext.promise = promise;
	return promise;
}
