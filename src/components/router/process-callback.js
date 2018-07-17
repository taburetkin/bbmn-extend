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
		let result = callback && callback(...args);
		executeResult.value = asPromise ? toPromise(result) : result;
		return executeResult.value;
	};
}


export function processCallback(router, actionContext, routeType){	
	
	let asPromise = router.getOption('callbackAsPromises');
	let executeResult = {};
	let callback = getCallbackFunction(actionContext.callback, executeResult, asPromise);

	let args = router.getOption('classicMode') 
		? actionContext.rawArgs || [] 
		: [ actionContext ];

	router.execute(callback, args);

	if (asPromise) {
		let delegate = router.getOption('delegatePromiseErrorsTo');
		let catchErrors = router.getOption('catchPromiseErrors');		
		return executeResult.value.then(
			(arg) => {
				postProcessCallback({
					failed: arg === false, 
					routeType, args, router, actionContext					
				});
				return arg;
			},
			(error) => {

				if (delegate && _.isFunction(delegate.trigger)) {
					triggerMethodOn(delegate, 'route:error', actionContext, error);
				} else {
					if(!catchErrors)
						return Promise.reject(error);
				}
			}
		);
	} else {
		postProcessCallback({
			failed: executeResult.value === false, 
			routeType, args, router, actionContext
		});
		return executeResult;
	}

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
