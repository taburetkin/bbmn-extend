import { isInPage } from './utils';

export default {

	//desc: setups the collection for ViewManager instance
	//returns: previous collection
	setCollection(collection, { init = false} = {}){
		
		if (this.collection == collection) return;

		//take previous collection for return
		let previousCollection = this.collection;

		//take contexts to destroy
		let destroy = this._removeCollection() || [];

		this.collection = collection;

		if (collection == null && destroy.length){
			this.trigger('change', { destroy });
			return;
		}

		init && this.initModels();
		this._setCollectionListeners();


		return previousCollection;
	},
	_clearCollectionStore(){
		
		let store = this._store;
		store.filtered.length = 0;
		store.items.length = 0;
		store.byModel = {};
		store.isFiltered = false;
		store.isSorted = false;
	},
	_removeCollection(){
		if (this.collection == null) return;

		let previousCollection = this.collection;

		this.stopListening(previousCollection);

		let destroy = this._removeItems(previousCollection.models);

		delete this.collection;

		this._clearCollectionStore();

		delete this._modelsInitialized;

		return destroy;

	},
	_setCollectionListeners(){

		this.listenTo(this.collection, 'update', this._onCollectionUpdate);
		this.listenTo(this.collection, 'reset', this._onCollectionReset);
		this.listenTo(this.collection, 'sort', this._onCollectionSort);
	},

	//first run, initialized all collection models
	initModels(){

		if(this._modelsInitialized) return;

		this._rebuildModels();

		this._modelsInitialized = true;

	},

	_rebuildModels({ sort = true} = {}){

		let items = this._store.items;
		let filtered = this._store.filtered;
		items.length = 0;
		filtered.length = 0;

		let filter = this.getFilter();
		let models = this.collection.models;

		for(let index = 0, length = models.length; index < length; index++) {
			let model = models[index];

			let context = this._getModelContext(model, { create: true });
			context.index = index;

			this._storeContext(context);
			items.push(context);

			if(!filter || filter(context))
				filtered.push(context);

		}
		this._store.isFiltered = true;

		sort && this._sortItems(filtered, { comparator: this.getComparator(), force: true },'rebuild');
		this._store.isSorted = sort;

	},
	_onCollectionUpdate(col, opts = {}){

		let { changes = {} } = opts;
		let { added = [], removed = [], merged = [] } = changes;
		let destroy;
		if (removed.length) {

			destroy = this._removeItems(removed);
			this._rebuildModels();

		} else {
			if(added.length) {				
				let data = this._filterItems(added, { force: true });
				this._addItems(data.attach, { isSorted: false });		
			}
			if(merged.length){
				this._store.isFiltered = false;
			}
			if((added.length || merged.length) && !_.isFunction(this.getComparator())){
				this._updateIndexes();
			}
		}
		this.processAndRender({ destroy });
	},

	_addItems(items, {isSorted, isFiltered} = {}){

		if(!items || !items.length) return;

		isSorted != null && (this._store.isSorted = isSorted);
		isFiltered != null && (this._store.isFiltered = isFiltered);

		let filter = this.getFilter();

		let _items = this._store.items;
		let _filtered = this._store.filtered;

		for (let index = 0, length = items.length; index < length; index++) {
			let item = items[index];
			_items.push(item);
			if(!filter || filter(item))
				_filtered.push(item);
		}
		this._store.isFiltered = true;

	},	

	_onCollectionSort(col, { add, merge, remove } = {}){

		if (_.isFunction(this.getComparator())) return;
		if (add || remove || merge) {
			return;
		}

		this._updateIndexes();

		let items = this._getItems();
		this._sortItems(items, { comparator: this._dataComparator, force: true },'collectionsort');
		this._store.isSorted = true;
		this.processAndRender();

	},

	_onCollectionReset(col, { previousModels = []} = {}){

		let destroy = this._removeItems(previousModels);
		this._rebuildModels();
		this.processAndRender({ destroy });

	},
};
