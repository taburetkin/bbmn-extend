import { invokeOnContext } from './invoke-on-context';


function isPromisable(arg){
	return arg instanceof Promise || _.isFunction(arg && arg.then);
}

function asArray(arg) {
	if(_.isArray(arg))
		return arg;
	else if(arg == null || arg === '')
		return [];
	else
		return [arg];
}




export function getCanNotRunPromise(processContext){

	let contextMethod = 'can:not:' + processContext.name;
	let promise = invokeOnContext(processContext, contextMethod);

	if(promise == null || promise === '') {

		promise = Promise.resolve();
	}
	else if(!isPromisable(promise)) {

		promise = Promise.reject(promise);
	}

	return Promise.race([
		processContext.cancelation.promise, 
		promise
	]);

}


export function getWaitPromise(processContext) {

	let contextMethod = 'get:' + processContext.name + ':promises';
	let promises = asArray(invokeOnContext(processContext, contextMethod));

	return Promise.race([
		processContext.cancelation.promise, 
		Promise.all(promises)
	]);

}
