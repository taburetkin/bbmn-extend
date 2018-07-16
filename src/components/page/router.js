import BaseRouter from '../router';

export default BaseRouter.extend({
	
	classicMode:false,
	isRouterHoldsActions : false,
	isRouteChaining: false,	
	callbacksAsPromises: true,
	registerPageRoutes(page){
		let contexts = page.getRoutesContexts();
		_(contexts).each(context => {
			let callback = (...args) => {
				return page.start(...args);
			};
			this.addRoute(context.route, context.name, callback);
		});
	},
	// processCallback(actionContext, routeType){

	// 	routeType || (routeType = 'route');
	// 	this.triggerRouteEvents(actionContext, routeType, actionContext.name, actionContext);
	// 	return actionContext.callback().then(
	// 		() => {},
	// 		(error) => this.processCallbackError(actionContext, error)
	// 	);
	// 	// return actionContext.page.start(actionContext).catch((error, ...args) => {

	// 	// 	this.processStartError(actionContext, error);

	// 	// });
	// },
	// processCallbackError(ac, error){

	// },

	/*
	processStartError(actionContext, error){
		actionContext.error = error;
		let errorEvents = [this.createErrorEvent(error, actionContext)];
		let customErrors = this.processCustomError(error, actionContext);
		customErrors && !_.isArray(customErrors) && (customErrors = [customErrors]);
		this.triggerErrors(actionContext, errorEvents.concat(customErrors || []));		
	},
	createErrorEvent(risedError, actionContext, name){
		name != null && (name = ':' + String(name));
		!name && (name='');
		let error = {
			event: `error${name}`,
			args: [risedError, actionContext]
		};
		return error;
	},
	processCustomError(error, actionContext){
		let errors = [];
		if(error.status != null){
			errors.push(this.createErrorEvent(error, actionContext, error.status));
		}
		return errors;
	},
	triggerErrors(actionContext, errorEvents){
		//console.log('START ERRORS', errorEvents);
		let page = actionContext.page;
		_(errorEvents).each((errorEvent) => {
			page.trigger(errorEvent.event,  ...(errorEvent.args || []));
		});
	},
	*/
});
