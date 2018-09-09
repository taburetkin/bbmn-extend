
const defaultCssConfig = {
	beforeRender: true,
	modelChange: true,
	refresh: true,
};

export default (Base) => Base.extend({
	constructor(){
		if(!this.cssClassModifiers) {
			this.cssClassModifiers = [];
		}
		Base.apply(this, arguments);
		this._setupCssClassModifiers();		
	},

	refreshCssClass(){
		let className = this._getCssClassString();
		if(className == ''){
			this.$el.removeAttr('class');
		}
		else {
			this.$el.attr({
				class: className
			});
		}
	},	

	_getCssClassModifiers(){
		let optsModifiers = this.getOption('cssClassModifiers',{deep:false, args:[this.model, this]});
		let propsModifiers = this.getProperty('cssClassModifiers',{deep:false, args:[this.model, this]});
		let modifiers = [this.getOption('className')].concat(optsModifiers || [], propsModifiers || []);
		return modifiers;
	},
	//override this if you need other logic
	getCssClassModifiers(){
		return this._getCssClassModifiers();
	},
	_getCssClassString()
	{
		let modifiers = this.getCssClassModifiers();
		let classes = _(modifiers).map((cls) => {
			return _.isString(cls) 
				? cls 
				: _.isFunction(cls) 
					? cls.call(this, this.model, this) 
					: null;
		});
		let ready = _(classes).filter((f) => f != null && f != '');
		let className = _.uniq(ready).join(' ');
		return (className || '').trim();
	},

	_setupCssClassModifiers(){

		if(this._cssClassModifiersInitialized) return;

		let cfg = this.getCssClassConfig();
		if(!cfg) return;

		let events = this.getCssClassEvents(cfg);
		_(events).each((eventName) => this.on(eventName, this.refreshCssClass));

		if (cfg.modelChange && this.model) {
			this.listenTo(this.model, 'change', this.refreshCssClass);
		}

		this._cssClassModifiersInitialized = true;
	},
	
	_getCssClassConfig(){
		let cfg = _.extend({}, defaultCssConfig, this.getOption('cssClassConfig'));
		if(!cfg || _.size(cfg) == 0) return;
		return cfg;
	},
	//override this if you need other logic
	getCssClassConfig(){
		return this._getCssClassConfig();
	},

	_getCssClassEvents(cfg){
		let events = [].concat(cfg.events || []);
		if(cfg.refresh) events.push('refresh');
		if(cfg.beforeRender) events.push('before:render');
		events = _(events).uniq();
		return events;
	},
	//override this if you need other logic
	getCssClassEvents(cfg){
		return this._getCssClassEvents(cfg);
	}
});
