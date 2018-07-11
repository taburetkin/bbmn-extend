import result from '../../../utils/better-result';
import normalizeRegion from './normalize-region';
export default Base => Base.extend({
	constructor(){
		this._nestedViews = {};
		Base.apply(this, arguments);
		this.initializeNestedViews();
	},
	showAllNestedViewsOnRender: false,
	showNestedViewOnAdd: false,
	initializeNestedViews(){
		if (this._nestedViewsInitialized) return;
		if(this.getOption('showAllNestedViewsOnRender')) {
			this.on('render', () => this.showAllNestedViews());
		}

		let nesteds = this.getOption('nestedViews', { args:[this.model, this]});
		_(nesteds).each((context, index) => {

			let name = _.isString(index) ? index : context.name;			
			this.addNestedView(name, context);

		});

		this.once('destroy',() => delete this._nestedViews);

		this._nestedViewsInitialized = true;
	},
	_normalizeNestedContext(name, context){
		//unwrap to plain object
		if (_.isFunction(context)) {
			context = context.call(this, this.model, this);
		}

		//fix name if its not provided
		if (context.name == null)
			context.name = name || _.uniqueId('nested');

		//convert region to valid function
		context = normalizeRegion.call(this, context);		


		return context;
	},
	_createNestedContext(context){
		let contexts = this.getNestedViewContext();
		contexts[context.name] = context;
	},

	addNestedView(name, context){
		if (_.isObject(name)) {
			context = name;
			name = undefined;
		}
		context = this._normalizeNestedContext(name, context);
		this._createNestedContext(context);
		if(this.getOption('showNestedViewOnAdd') && this.isRendered()){
			this.showNestedView(context);
		}		
	},

	showNestedView(name){
		let region = this.getNestedViewRegion(name);
		if (!region) return;

		let view = this.buildNestedView(name);
		if (!view) return;

		return region.show(view);
	},
	showAllNestedViews(){
		let contexts = this.getNestedViewContext();
		_(contexts).each(context => this.showNestedView(context));
	},
	getNestedViewContext(name){
		let contexts = this._nestedViews;
		if (arguments.length == 0)
			return contexts;
		else
			return contexts[name];
	},


	buildNestedView(name){

		let context = _.isObject(name) ? name
			: _.isString(name) ? this.getNestedViewContext(name)
				: null;

		if(!context) return;

		let View = context.View;
		let options = this.buildNestedViewOptions(result(context, 'options', { context: this, args: [this, this.model], default:{} }));
		
		return new View(options);
	},
	buildNestedViewOptions(opts){
		return opts;
	},
	getNestedViewRegion(name){
		let context = _.isObject(name) ? name
			: _.isString(name) ? this.getNestedViewContext(name)
				: null;
		return context && _.result(context, 'region');
	}
	
});
