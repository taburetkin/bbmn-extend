export default CollectionView => CollectionView.extend({
	shouldHandleEmptyFetch: true, 
	constructor(){
		CollectionView.apply(this, arguments);

		this.getOption('shouldHandleEmptyFetch') && this.emptyView
			&& this._handleEmptyFetch();
	},
	_handleEmptyFetch(){
		if (!this.collection || this.collection.length) { return; }

		this.listenToOnce(this.collection, 'sync', 
			() => !this.collection.length && this._renderChildren()
		);

	},
});
