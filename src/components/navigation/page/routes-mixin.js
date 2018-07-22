import BaseRouter from './router';
import comparator from '../../../utils/comparator';

export default {
	initializeRoutes(){
		if (this.initializeRouter()) {
			this._buildRoutes();
		}
	},
	initializeRouter(){		
		if(this.getOption('shouldCreateRouter') && !this.router)
			this.router = this._createRouter();

		return !!this.router;
	},
	_createRouter(){
		let Router = this.getOption('Router') || BaseRouter;
		let options = _.extend({}, this.getOption('routerOptions'));
		return new Router(options);
	},
	_buildRoutes(){
		this._buildRoutesContexts();
		this.router.registerPageRoutes(this);
	},
	_buildRoutesContexts(){
		let routes = this.getOption('routes', {args: [this]});
		if (routes == null) return;
		if(_.isString(routes))
			routes = [routes];

		let result = [];
		let config = this.getRoutesConfig();
		_(routes).each((route, index) => {
			let context = this._normalizeRoutesContextRoute(route, index, config);
			_.isObject(context) && (result.push(context));
		});
		this.routesContext = result;
		return this.routesContext;
	},
	_normalizeRoutesContextRoute(arg, index, config = {}){
		if(arguments.length < 2){
			config = this.getRoutesConfig();
		}
		let context = {};
		if(arg == null)
			return;
		if (_.isString(arg)) {
			_.extend(context, {route: arg, rawRoute: arg });
		} else if(_.isFunction(arg)) {
			arg = arg.call(this, this, index);
			return this._normalizeRoutesContextRoute(arg, index);
		} else {
			_.extend(context, arg);
		}
		let name = (_.isString(index) && index) || context.name || context.route || _.uniqueId('route');
		context.name = name;

		if(_.isNumber(index) && context.order == null)
			context.order = index;

		if (!context.rawRoute)
			context.rawRoute = context.route;
				
		if(config.relative && config.parentContext)
			context.route = config.parentContext.route + '/' + context.route;

		return context;
	},
	getRoutesConfig(){
		let config = _.extend({ 
			relative: this.getOption('relativeRoutes', {args: [this]}),
			parent: this.parent,
			parentContext: this.parent && _.isFunction(this.parent.getMainRouteContext) && this.parent.getMainRouteContext()
		}, this.getOption('routesConfig', {args: [this]}));
		console.log('-',this.cid, config);
		return config;
	},
	getRoutesContexts(opts = {}){
		let { clone, reverse } = opts;
		let result = this.routesContext || [];
		if (clone || reverse) result = [].slice.call(result);
		if (reverse) result.reverse();
		return result;
	},

	getMainRouteContext(){
		// let contexts = this.getRoutesContexts();
		// console.log(contexts);
		if(this.mainRouteContext) return this.mainRouteContext;
		this.mainRouteContext = _(this.getRoutesContexts())
			.chain()
			.sortBy((a,b) => comparator([ [b,a, c => c.main], [a,b, c => c.order] ]))
			.take(1)
			.value()[0];

		return this.mainRouteContext;
	}
};
