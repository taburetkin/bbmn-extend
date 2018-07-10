import result from '../../../utils/better-result';
export default Base => Base.extend({
	constructor(){
		this._nestedViews = {};
		Base.apply(this, arguments);
		this.initializeNestedViews();
	},
	showAllNestedViewsOnRender: false,
	initializeNestedViews(){

		if(this.getOption('showAllNestedViewsOnRender')) {
			this.on('render', () => this.showAllNestedViews());
		}

		let nesteds = this.getOption('nestedViews',{ args:[this.model, this]});
		_(nesteds).each((context, index) => {
			context = this._normalizeNestedContext(context, index);
			this._createNestedContext(context);
		});

		this.once('destroy',() => delete this._nestedViews);
	},
	_normalizeNestedContext(context, index){
		if (_.isFunction(context)) {
			context = context.call(this, this.model, this);
		}

		let name = _.isString(index) ? index 
			: _.isString(context.name) ? context.name
				: _.uniqueId('nested');

		if(context.name != name)
			context.name = name;

		if (!_.isFunction(context.region) && _.isObject(context.region)) {
			let regionHash = context.region;

			context.region = () => {

				if (regionHash.updateDom) {
					if (_.isFunction(regionHash.updateDom)) {
						regionHash.updateDom.call(this, this.$el);
					} else if(regionHash.updateDom === true) {
						let selector = 'region-' + context.name;
						this.$el.append($('<div>').addClass(selector));
						regionHash.el = '.' + selector;
					}
				}

				let region = this.getRegion(regionHash.name || context.name);
				if (!region) {
					region = this.addRegion(regionHash.name || context.name, regionHash);
				}
				
				return region;
			};
		}

		if(!context.region && context.regionName)
			context.region = () => this.getRegion(context.regionName);

		return context;
	},
	_createNestedContext(context){
		let contexts = this.getNestedViewContext();
		contexts[context.name] = context;
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
		_(contexts).each(context => this.showNestedView(context.name));
	},
	getNestedViewContext(name){
		let contexts = this._nestedViews;
		if (arguments.length == 0)
			return contexts;
		else
			return contexts[name];
	},


	buildNestedView(name){
		let cfg = this.getNestedViewContext(name);
		if(!cfg) return;

		let View = cfg.View;
		let options = this.buildNestedViewOptions(result(cfg, 'options', { context: this, args: [this, this.model], default:{} }));
		
		return new View(options);
	},
	buildNestedViewOptions(opts){
		return opts;
	},
	getNestedViewRegion(name){
		let cfg = this.getNestedViewContext(name);
		return cfg && cfg.region 
			&& _.result(cfg, 'region');
	}
	
});