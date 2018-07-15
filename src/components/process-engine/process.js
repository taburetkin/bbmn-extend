import { triggerBegin, triggerBefore, triggerComplete, triggerError } from './triggers';
import { getCanNotRunPromise, getWaitPromise } from './run-promises';


export default function process(processContext){
	
	let promise = new Promise((resolve, reject) => {

		triggerBegin(processContext);

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
		).catch((error) => {			
			triggerError(processContext, error);
			reject(processContext);
		});

	});
	processContext.promise = promise;
	return promise;
}
