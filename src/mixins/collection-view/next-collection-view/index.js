export default CollectionView => CollectionView.extend({
	_renderChildren() {
		// If there are unrendered views prevent add to end perf
		if (this._hasUnrenderedViews) {
			delete this._addedViews;
			delete this._hasUnrenderedViews;
		}

		const views = this._addedViews || this.children._views;

		this.triggerMethod('before:render:children', this, views);
	
		this._showEmptyView();
	
		const els = this._getBuffer(views);
	
		this._attachChildren(els, views);
	
		delete this._addedViews;
	
		this.triggerMethod('render:children', this, views);
	},
	addChildView(view, index, options = {}) {
		if (!view || view._isDestroyed) {
			return view;
		}

		if (_.isObject(index)) {
			options = index;
		}

		// If options has defined index we should use it
		if (options.index != null) {
			index = options.index;
		}

		if (!this._isRendered && !options.preventRender) {
			this.render();
		}

		this._addChild(view, index);

		if (options.preventRender) {
			this._hasUnrenderedViews = true;
			return view;
		}

		const hasIndex = (typeof index !== 'undefined');
		const isAddedToEnd = !hasIndex || index >= this._children.length;

		// Only cache views if added to the end and there is no unrendered views
		if (isAddedToEnd && !this._hasUnrenderedViews) {
			this._addedViews = [view];
		}
		
		if (hasIndex) {
			this._renderChildren();
		} else {
			this.sort();
		}
	
		return view;
	},
	_showEmptyView() {

		this._destroyEmptyView();
	
		if(!this.isEmpty()) { return; }

		const EmptyView = this._getEmptyView();	
		if (!EmptyView) {
			return;
		}
	
		const options = this._getEmptyViewOptions();
		this._emptyViewInstance = new EmptyView(options);
	
		this.addChildView(this._emptyViewInstance, { preventRender: true, index: 0, });
	
	},
	_destroyEmptyView(){
		let view = this._emptyViewInstance;
		if (!view) return;
	
		this._removeChildView(view);
	
		this._removeChild(view);
	
		view.destroy();
		delete this._emptyViewInstance;
	},
}, { CollectionViewMixin_4x: true});
