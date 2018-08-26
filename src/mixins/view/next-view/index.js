import ViewManager from '../../../components/view-manager';

export default BaseView => BaseView.extend({
	
	constructor(options){
		this.options = options;
		this.mergeOptions(options,['managedCollection','collection','viewFilter','viewComparator', 'modelView', 'modelViewOptions', 'emptyView', 'emptyViewOptions']);
		
		BaseView.apply(this, arguments);
		
		//tries to initialize viewManager
		this._initializeViewManager();
	},

	template: _.noop,
	//if true - initializes ViewManager without collection support
	enableCustomViews: false,
	//if true - initializes ViewManager with collection and customviews support
	enableCollectionViews: false,

	_initializeViewManager(){
		let customs = this.getOption('enableCustomViews');
		let models = this.getOption('enableCollectionViews');
		if(!(customs || models)) return;
		
		this._fallbackOptions();

		this._viewManager = new ViewManager({
			enableCollection: models,
			collection: models && this.managedCollection || this.collection || null,
			view: this,
			$container: this.getChildrenContainer(),
			modelView: this.modelView,
			modelViewOptions: this.modelViewOptions,
			dataFilter: this.getFilter(),
			dataComparator: this.getComparator(),
			emptyView: this.emptyView,
			emptyViewOptions: this.emptyViewOptions,

		});

		if (this._customViewsQueue) {
			_.each(this._customViewsQueue, args => this._viewManager.addCustomView.apply(this._viewManager, args));
			this._customViewsQueue.length = 0;
			delete this._customViewsQueue;
		}

	},

	_fallbackOptions(){
		if(!this.modelView) {
			this.modelView = this.childView || this.options.childView;
		}
		if(!this.modelViewOptions){
			this.modelViewOptions = this.childViewOptions || this.options.childViewOptions;
		}
	},	


	/*
		render has two additional calls
			- this._viewManager.beforeRender()
			- this._viewManager.processAndRender()
	*/
	render() {
		const template = this.getTemplate();

		if (template === false || this._isDestroyed) { return this; }

		this._viewManager && this._viewManager.beforeRender();

		this.triggerMethod('before:render', this);


		// If this is not the first render call, then we need to
		// re-initialize the `el` for each region
		if (this._isRendered) {
			this._reInitRegions();
		}

		this._renderTemplate(template);
		this.bindUIElements();

		this._viewManager && this._viewManager.processAndRender();

		this._isRendered = true;
		this.triggerMethod('render', this);

		return this;
	},


	getChildrenContainer(){
		return this.getOption('childrenContainer', { force: false });
	},

	/*
		managing sort and filter
	*/
	setComparator(comparator, opts) {
		this._viewManager && this._viewManager.setComparator(comparator, opts);
		this.viewComparator = comparator;
		return this;
	},
	getComparator(){
		return this.viewComparator;
	},
	setFilter(filter, opts) {
		this._viewManager && this._viewManager.setFilter(filter, opts);
		this.viewFilter = filter;
		return this;
	},
	getFilter(){
		return this.viewFilter;
	},


	/*
		fallback methods for CollectionView 
	*/
	sort(){
		this._viewManager && this._viewManager.processAndRender({ forceSort: true, forceFilter: true });
	},
	filter(){
		this._viewManager && this._viewManager.processAndRender({ forceFilter: true });
	},	

	addChildView(...args){
		if (!args || args.length == 0) return;
		if (this._viewManager) {
			this._viewManager.addCustomView.apply(this._viewManager, arguments);
		} else {
			this._customViewsQueue || (this._customViewsQueue = []);
			this._customViewsQueue.push(args);
		}
	},

});
