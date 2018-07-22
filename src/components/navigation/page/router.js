import Process from '../../process';
import BaseRouter from '../router';
import errorHandler from '../route-error-handler';

export default BaseRouter.extend({
	
	classicMode:false,
	isRouterHoldsActions : false,
	isRouteChaining: false,	
	callbackAsPromises: true,
	routeCaseInsensitive: true,
	registerPageRoutes(page){
		let contexts = page.getRoutesContexts({ reverse: true });
		_(contexts).each(context => {
			let callback = (...args) => {
				return page.start(...args);
			};
			this.addRoute(context.route, context.name, callback);
		});
	},
	handleError(process, action){
		let args, error;

		if(process instanceof Process) {
			args = [].slice.call(process.errors) ;
			error = args.shift();
			args.push(action);
		} else {
			error = process;
			args = [action];
		}

		errorHandler.handle(error, this, args);

		//BaseRouter.prototype.handleError(error, action);
	},	
});
