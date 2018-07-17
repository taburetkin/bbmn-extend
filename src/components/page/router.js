import BaseRouter from '../router';

export default BaseRouter.extend({
	
	classicMode:false,
	isRouterHoldsActions : false,
	isRouteChaining: false,	
	callbacksAsPromises: true,
	routeCaseInsensitive: true,
	registerPageRoutes(page){
		let contexts = page.getRoutesContexts();
		_(contexts).each(context => {
			let callback = (...args) => {
				return page.start(...args);
			};
			this.addRoute(context.route, context.name, callback);
		});
	},
});
