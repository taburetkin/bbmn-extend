import { isModel } from '../../../vendors/helpers';

function rebuildIndexes() {
	if (!this.getOption('shouldRebuildIndexes') || !this.collection) {
		return;
	}
	let models = this.collection.models;
	for (let index = 0, length = models.length; index < length; index++) {
		let model = models[index];
		let view = this.getModelView(model);
		view && (view._index = index);
	}
}

export default CollectionView => CollectionView.extend({
	shouldRebuildIndexes: true,

	constructor() {
		this.on('before:sort', rebuildIndexes.bind(this));
		CollectionView.apply(this, arguments);
	},
	_addChild(view){
		view._isModelView = arguments.length;
		return CollectionView.prototype._addChild.apply(this, arguments);
	},
	_viewComparator(v1,v2){
		let res = v1._index - v2._index;
		if (res) return res;
		if (v1._isModelView) return 1;
		return -1;
	},
	getModelView(model){
		if (!this.collection || model == null) { return; }
		if (!isModel(model)) {
			model = this.collection.get(model);
			if ( model == null) { return; }
		}
		
		return this._children.findByModel(model);
	}
});
