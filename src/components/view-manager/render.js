import { destroyView, renderView } from './utils';

export default {

	triggerViewMethod(){
		this.view.triggerMethod.apply(this.view, arguments);
	},
	getChildrenContainer(){
		if(_.isString(this.$container))
			return this.view.$(this.$container);
		else if(_.isFunction(this.$container))
			return this.$container();
		else
			return this.$container;
	},
	processAndRender(opts){
		let data = this.process(opts);
		this.render(data);
	},
	beforeRender(){
		if (this.view._isRendered) {
			this.removeCustomViews();
		}
		else {
			this.initModels();
		}
	},
	render(data){		
		if(!data) {
			return;
		}
		else {

			this.triggerViewMethod('before:render:children', data);

			if(this.view._isRendered)
				this.removeCustomViews();

			this._destroyChildViews(data.destroy);
			this._detachChildViews(data.detach);
			this._attachChildViews(data.attach);

			this.triggerViewMethod('render:children', data);

		}
	},


	_destroyChildViews(views = []){
		if(!views.length) return;
		let $container = this.getChildrenContainer();
		this.triggerViewMethod('before:destroy:children', this);

		if (this.view.monitorViewEvents === false) {
			this.view.Dom.detachContents($container);
		}
	
		const shouldDisableEvents = this.view.monitorViewEvents === false;
		_.each(views, view => {
			this._destroyChildView(view, shouldDisableEvents);
		});
	
	
		this.triggerViewMethod('destroy:children', this);

	},

	_destroyChildView(view, shouldDisableEvents){

		if(shouldDisableEvents == null)
			shouldDisableEvents = this.view.monitorViewEvents === false;

		//view.off('destroy', this.removeChildView, this);
		if (!view || view._isDestroyed) {
			return;
		}
		destroyView(view, shouldDisableEvents);		
		this.view.stopListening(view);
	},

	_detachChildViews(contexts = []){
		if(!contexts.length) return;
		let monitorViewEvents = this.monitorViewEvents !== false;
		_.each(contexts, context => {
			this._detachChildView(context.view, monitorViewEvents);
		});
	},

	_detachChildView(view, monitorViewEvents){
		if(!view) return;
		if(monitorViewEvents == null) {
			monitorViewEvents = this.view.monitorViewEvents !== false;
		}
		const shouldTriggerDetach = view._isAttached && monitorViewEvents;
		if (shouldTriggerDetach) {
			view.triggerMethod('before:detach', view);
		}
				
		this.view.Dom.detachEl(view.el, view.$el);
		if (shouldTriggerDetach) {
			view._isAttached = false;
			view.triggerMethod('detach', view);
		}	
		this.stopListening(view);
	},

	_attachChildViews(contexts = []){
		if(!contexts.length) return;
		
		const shouldTriggerAttach = this.view._isAttached && this.view.monitorViewEvents !== false;

		const elBuffer = this.view.Dom.createBuffer();
		let $container = this.getChildrenContainer();
		_.each(contexts, context => {
			let view = this._ensureContextHasView(context);

			if(!view) return;
			if (!view._isAttached) {
				this._proxyChildViewEvents(view);
			}
			renderView(view);
			this.view.Dom.appendContents(elBuffer, view.el, {_$contents: view.$el});

			if (shouldTriggerAttach && !view._isAttached) {				
				view.triggerMethod('before:attach', view);
			}
		});

		this.view.Dom.appendContents($container[0], elBuffer, {_$el: $container});

		if(shouldTriggerAttach){
			_.each(contexts, context => {
				let view = context.view;
				if(!view || view._isAttached) return;
				view._isAttached = true;
				view.triggerMethod('attach', view);
			});			
		}
	},
	_ensureContextHasView(context){
		if (context.view && !context.view._isDestroyed)
			return context.view;
		else if (context.isCollection) {
			context.view = this._createModelChildView(context.model);
			return context.view;
		} else if(context.rebuild && _.isFunction(context.build)) {
			this._buildContextView(context);
			return context.view;
		} 
	},
	_buildContextView(context){
		context.view = context.build();
		if (_.isFunction(context.onBuild)) {
			context.onBuild.call(this.view, context.view);
		}
	},
	_createModelChildView(model){
		let View = this._getChildViewClass(model);
		if(!View) return;
		let options = this._getChildViewOptions(model, View);
		return new View(options);
	},
	_getChildViewClass(model){
		if(this.modelView === Backbone.View || this.modelView.prototype instanceof Backbone.View)
			return this.modelView;
		else {
			return this.modelView(model);
		}
	},
	_getChildViewOptions(model, View){
		let options = {};
		if(_.isFunction(this.modelViewOptions)){
			options = this.modelViewOptions.call(this, model, View, this) || {};
		} else if(_.isObject(this.modelViewOptions)) {
			options = this.modelViewOptions;
		}
		return _.extend({}, options, { model });
	},




};
