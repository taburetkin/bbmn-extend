import triggerMethodOn from '../../mn/trigger-method-on';

function toPromise(arg, resolve = true){
	if (arg instanceof Promise || (arg && _.isFunction(arg.then)))
		return arg;
	else
		return resolve 
			? Promise.resolve(arg) 
			: Promise.reject(arg);
}
function getCallbackFunction(callback, executeResult, asPromise)
{
	return (...args) => {
		executeResult.value = callback && callback(...args);
		executeResult.promise = toPromise(executeResult.value);
		return executeResult.value;
	};
}


export function processCallback(router, actionContext, routeType){	
	
	let args = router.getOption('classicMode') 
		? actionContext.rawArgs || [] 
		: [ actionContext ];

	let asPromise = router.getOption('callbackAsPromises');
	let executeResult = {};
	let callback = getCallbackFunction(actionContext.callback, executeResult, asPromise);

	//console.log('routeType:',routeType);

	router.triggerEvent('before:' + routeType, actionContext);

	let shouldTriggerEvent = router.execute(callback, args);
	if (shouldTriggerEvent !== false) {
		router.triggerEvent(routeType, actionContext);
	}

	executeResult.promise.then(
		(arg) => {
			router.triggerEvent('after:'+routeType, actionContext);
			return arg;
		},
		() => {
			router.triggerEvent('error:' + routeType, actionContext);
		}
	);

	return executeResult.value;
}


function postProcessCallback({ failed, routeType, args, router, actionContext })
{
	let event = failed ? 'fail' : routeType;
	router.triggerRouteEvents(actionContext, event, actionContext.name, ...args);

	// let delegate = router.getOption('delegatePromiseErrorsTo');
	// let catchErrors = router.getOption('catchPromiseErrors');

	// resultContext.result.then(
	// 	(arg) => arg,
	// 	(error) => {
	// 		if (delegate && _.isFunction(delegate.trigger)) {
	// 			triggerMethodOn(delegate, 'route:error', actionContext, error);
	// 		} else {
	// 			if(!catchErrors)
	// 				return Promise.reject(error);
	// 		}
	// 	}
	// );
}
