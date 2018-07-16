import mix from '../../utils/mix';
import GetOptionMixin from '../../mixins/common/get-option';
import paramStringToObject from '../../utils/params-to-object';

//import result from '../../utils/better-result';
const BaseRouter = mix(Router).with(GetOptionMixin);
const Router = BaseRouter.extend({


	// for migrating from Mn.AppRoute
	// set to true. it will populate routes from { controller, appRoutes } structure.
	isMarionetteStyle: false,

	// by default Backbone.Router tries to lookup callback in router instance by name `callback = this[name]` if there is no callback provided
	// its recomend to turn this feature to false
	// default value is true for Backbone.Router compatability
	isRouterHoldsActions : true,

	// by default Backbone.Router `route` method returns router itself instead of just created routeContext for chaining purposes.
	// you can change this behavior turning this feature to false
	isRouteChaining: true,

	//in classic mode actions receive argument array
	//if you need actionContext instead turn this option to false
	classicMode: true,

	constructor(options = {}){
		
		this.options = _.extend({}, _.result(this, 'options'), options);

		BaseRouter.apply(this, arguments);

		this.on('re:route:last', this._onReRouteLast);
	},


	/*

		initialize methods
		"when a router initialized"

	*/

	//by default router expects that routes will result in { route, callback } hash
	//we are extending this to provide more flexibility
	_bindRoutes: function() {
		
		let routes = this.getInitRoutes();
		if(!_.size(routes)) return;
		this.addRoutes(routes);

	},

	getInitRoutes(){
		let routes;
		if(!this.getOption('isMarionetteStyle'))
			routes = this.getOption('routes');
		else {
			let cntrl = this.getOption('controller') || {};
			let approutes = this.getOption('appRoutes') || {};
			routes = _(approutes).map((name, route) => _.create({}, { route, name, callback:cntrl[name] }));
		}
		return routes;
	},


	/*
	
		register new route methods
		"when a new route added"

	*/

	// refactored original route method
	// chain:true by default is for supporting default behavior
	// routerHoldsActions: true - backbone router tries to get callback from router itself if there is no callback provided. 
	// this options allow to support this behavior, but its recomended not to hold action inside router instance
	route(route, name, callback, opts = {}){
		
		//normalizing passed arguments and putting them into a context object
		//refactored from original route
		let context = this._normalizeRegisterRouteArguments(route, name, callback, opts);

		//extends context with result of `mergeWithRegisterRouteContext`
		this._normalizeRegisterRouteContext(context);

		//wrapping provided callback 
		this._normalizeRegisterRouteCallback(context);

		
		//refactored for providing possibility to override
		//at this point context should be almost ready
		this.registerRouteContext(context);

		this._storeCreatedContext(context, opts);



		if(opts.isRouteChaining === true)
			return this;
		else
			return context;
	},

	// provide more semantic alias for route
	addRoute(route, name, callback, opts = {}){
		if(opts.isRouteChaining == null)
			opts.isRouteChaining = this.getOption('isRouteChaining');

		let context = this.route(route, name, callback, opts);
		return context;
	},

	//process many routes at once
	//accepts object { name, routeContext | handler }
	// or array of routeContexts
	addRoutes(routes, opts = {}){

		if(opts.isRouteChaining == null)
			opts.isRouteChaining = this.getOption('isRouteChaining');

		let normalized = _(routes).map((value, key) => this._normalizeRoutes(value, key));

		if(opts.doNotReverse != true)
			normalized.reverse();

		let registered = _(normalized).map((route) => route && this.addRoute(route, _.extend({massAdd:true},opts))); 
		
		if(opts.doNotReverse != true)
			registered.reverse();

		_(registered).each((c) => this._storeCreatedContext(c));
		
		return registered;
	},

	// internal method called by `addRoutes` to normalize provided data
	_normalizeRoutes(value, key){
		//let route, name, callback;
		let context;
		if (_.isString(value)) {
			context = { 
				route: key, 
				name: value, 
			};
		}
		else if(_.isFunction(value)){
			context = { route:key, callback:value };
		}else if(_.isObject(value)){
			context = _.clone(value);
			if(!_.has(context, 'route'))
				context.route = key;
			else if(_.has(context, 'route') && !_.has(context, 'name'))
				context.name = key;
		}
		else {
			return;
		}
		return context;
	},


	//refactored out from original route method
	//just check passed arguments and mix them into an object
	_normalizeRegisterRouteArguments(route, name, callback, opts = {}){

		let context = {};

		if(_.isObject(route)){
			context = route;
			//_.extend(context, route);
			//then second argument is probably options;
			_.extend(opts, name);

		} else if (_.isFunction(name)) {
			_.extend(context, { route, callback: name, name: _.uniqueId('routerAction')});
		}else {
			_.extend(context, { route, name, callback });
		}


		!_(opts).has('isRouterHoldsActions') && (opts.isRouterHoldsActions = this.getOption('isRouterHoldsActions'));
		!_(opts).has('isRouteChaining') && (opts.isRouteChaining = this.getOption('isRouteChaining'));


		// last chance to get callback from router instance by name
		// this behavior can be disabled through `isRouterHoldsActions` options
		if(!_.isFunction(context.callback) && opts.isRouterHoldsActions)
			context.callback = this[context.name];


		//store original route
		context.rawRoute = context.route;

		!context.name && (context.name = _.uniqueId('routerAction'));

		//converts route to RegExp pattern
		if (!_.isRegExp(context.route)) context.route = this._routeToRegExp(context.route);

		return context;
	},

	//internal method for merging context with user defined object
	_normalizeRegisterRouteContext(context){
		_.extend(context, this.routeContext(context));
	},

	//override this method if you need more information in route context
	// should return object wich will be merged with default context
	// be aware of providing reserved properties: route, name, callback
	// this will override context defaults
	routeContext: _.noop,


	//wraps provided callback with correct environment
	//and some events triggers
	_normalizeRegisterRouteCallback(context){

		if(!_.isFunction(context.callback) )
			context.callback = () => {};

		context.originalCallback = context.callback;
		context.callback = _.bind(this._processCallback, this, context);

	},

	//finally, putting handler to the backbone.history.handlers
	registerRouteContext(context){
		Backbone.history.route(context.route, context.callback, context);
	},

	//store registered context for further use
	_storeCreatedContext(context, opts = {}){
		this.routeContexts || (this.routeContexts = {});
		if(!opts.massAdd)
			this.routeContexts[context.name] = context;
		return context;
	},



	/*
	
		process route methods		
		"when route happens"

	*/

	//inner route handler
	//preparing actionContext and calls public processCallback
	_processCallback (routeContext, fragment, options = {}) {
		let actionContext = this._createExecuteActionContext(routeContext, fragment, options);
		actionContext.options = options;
		if (actionContext.routeType == null) {

			actionContext.routeType = 'route';
			routeContext.lastAttempt = actionContext;
			//this.lastActionContext = routeContext;
		}
		//actionContext.restart = () => actionContext.callback(fragment, options);
		let result = this.processCallback(actionContext, actionContext.routeType);

		//this.triggerHistory(history, actionContext.fragment, actionContext);
		return result;
	},
	
	//by default behave as original router
	//override this method to process action by your own
	processCallback(actionContext, routeType){
		let resultContext = {};
		let toPromise = this.getOption('callbacksAsPromises');
		let callback = (...args) => { 
			let result = actionContext.originalCallback(...args);
			if (toPromise) {
				if (!(result instanceof Promise || (!!result && _.isFunction(result.then)))) {
					result = Promise.resolve(result);
				}
			}
			resultContext.result = result;			
		};

		let args = this.getOption('classicMode') 
			? actionContext.rawArgs || [] 
			: [actionContext];
		
		let event = this.execute(callback, args) !== false ? routeType : 'fail';
		this.triggerRouteEvents(actionContext, event, actionContext.name, ...args);

		return resultContext.result;
	},


	_onReRouteLast(){
		if(!this.lastAttempt) return;
		let ac = this.lastAttempt.lastActionContext;
		ac.callback(ac.fragment, ac.options);
	},


	//just triggers appropriate events
	triggerRouteEvents(context, event, name, ...args) {
		if (event == 'route') {
			this.lastActionContext = context;
		}
		this.trigger(`${event}:${name}`, ...args);
		this.trigger(event, name, ...args);
		Backbone.history.trigger(event, this, name, ...args);
	},

	//triggers directional event on History.
	// triggerHistory(history, fragment, actionContext){
	// 	Backbone.history.trigger(history, fragment, actionContext);
	// },

	//converts actions arguments array to actionContext
	// context : {
	//   qs: {},
	//   args:{},
	// }
	_createExecuteActionContext(context, fragment, options) {

		let rawArgs = this._extractParameters(context.route, fragment);
		let result = _.extend({}, context, { fragment, rawArgs }, options);
		let args = rawArgs.slice(0);
		_.extend(result, { qs: this._prepareActionQueryString(args) });
		_.extend(result, { args: this._prepareActionArguments(fragment, context.rawRoute, args) });
		result.reroute = () => {
			let newcontext = _.extend({ routeType: 'reroute' }, result);
			return newcontext.callback(fragment, options);
		};
		//actionContext.restart = () => actionContext.callback(fragment, options);
		return result;
	},

	//extracts last backbone action argument and converts it to key value object
	//using queryStringParser method.
	_prepareActionQueryString(args){
		if(!_.isArray(args) || args.length == 0 || (args.length == 1 && args[0] == null))
			return {};
		let rawQs = args.pop();
		return this.queryStringParser(rawQs);
	},

	//converts action arguments array to named object {key:value}
	_prepareActionArguments(fragment, rawRoute, args){
		let params = rawRoute.match(/:([^/|)]+)/g) || [];
		let res = {};
		_(params).each((name, index) => {
			name = name.substring(1);
			
			if(args == null) return;

			if(name in res && _.isArray(res[name]))
				res[name].push(args[index]);
			else if(name in res && !_.isArray(res[name]))
				res[name] = [res[name]].concat(args[index]);
			else
				res[name] = args[index];
		});
		return res;
	},

	//converts string to object
	//default implementation, can be overriden by user
	queryStringParser: paramStringToObject,	


	/*
		Some API methods
	*/

	getContextByFragment(fragment)	{
		if(!_.isString(fragment)) return;
		//let contexts = this.routeContexts;
		//console.log('Router contexts', contexts);
		let result = _(this.routeContexts).find((cntx) => cntx.route.test(fragment));
		return result;
	}


});

export default Router;
