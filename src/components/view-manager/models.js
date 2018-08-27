import { isInPage } from './utils';


export default {


	process({ destroy = [], silent, forceSort, forceFilter } = {}){

		this._removeEmptyViewInstance({ destroy });

		let items = this._getItems({ forceFilter });



		let totalDetach = [];

		if (!this._store.isFiltered || forceFilter) {
			let { attach, detach } = this._filterItems(items, { filter: this.getFilter() });
			this._setItems(attach, { isFiltered: true });
			items = attach;
			if(detach.length) {
				//resultData.detach = resultData.detach.concat(detach);
				totalDetach = totalDetach.concat(detach);
			}
			//resultDetach = detach;
		}
		this._sortItems(items, { comparator: this.getComparator(), force: forceSort },'process');
		this._store.isSorted = true;



		let data = this._filterItems(items, { paginator: this.getPaginator() });
		if(data.detach.length) {
			//resultData.detach = resultData.detach.concat(data.detach);
			totalDetach = totalDetach.concat(data.detach);
		}


		let attach = this._injectCustoms(data.attach, totalDetach, destroy);

		let result = {
			attach,
			detach: totalDetach,
			destroy,
			total: data.total,
			skiped: data.skiped,
			taked: data.taked
		};

		
		this.lastResult = result;
		if(!silent)
			setTimeout(() => this.trigger('change', result), 0);

		


		return result;
	},


	_getItems({ forceFilter } = {}){

		if (this._store.isFiltered && !forceFilter)
			return this._store.filtered;
		else
			return this._store.items;
	},

	_filterItems(items, { filter, paginator, force } = {}){

		let iterator = -1;
		let detach = [];
		let attach = [];


		if (!filter && !paginator && !force) {
			
			return { attach: items, detach:[] };
		
		}
		
		
		let shouldUpdateIndex = this.collection && items == this.collection.models;
		
		
		for(let index = 0, length = items.length; index < length; index++){

			let model = items[index];
			let item = model;
			let isModel = model instanceof Backbone.Model;
			let isNew = false;

			if (isModel) {
				item = this._getModelContext(model, { create: true, markNew: true });
				isNew = item.isNew === true;				
			}

			let pass = !filter || filter(item);
			if (!pass) {
				item.view && !item.view._isDestroyed && detach.push(item);
				continue;
			}

			if(isInPage(paginator, ++iterator)) {
				attach.push(item);

				if(shouldUpdateIndex){
					item.index = index;
				}
				if (isNew) {
					this._storeContext(item);
				}
			} else if (paginator && iterator > paginator.to){
				break;
			}			
		}

		
		let res = { attach , detach };
		if(paginator){
			res.total = items.length;
			res.skiped = paginator.from;
			res.taked = iterator - paginator.from - 1;
		}

		// resultData.attach = attach;
		// resultData.detach = detach;

		return res;
	},

	_sortItems(items, { comparator, force } = {}){

		if(this._store.isSorted && !force) { return; }

		if(!comparator) {
			comparator = this._dataComparator;
			if(!comparator) return;
		}

		if (this._store.isFiltered && items !== this._store.items) {
			setTimeout(() => this._sortItems(this._store.items, { comparator, force: true },'timeout sort'),0);
		}

		
		let iteratee = comparator.length == 1 
			? (a,b) => {
				let _a = comparator(a); let _b = comparator(b);
				if(_a < _b) return -1;
				if(_a > _b) return 1;
				return 0;				
			}
			: comparator;

		items.sort(iteratee);
		
	},


	_setItems(items, { isSorted, isFiltered } = {}){

		isSorted != null && (this._store.isSorted = isSorted);
		isFiltered != null && (this._store.isFiltered = isFiltered);
		if (isFiltered) {
			this._store.filtered = items;
		} else {
			this._store.items = items;
		}

	},

	_removeItems(items = []){

		let destroy = [];
		for (let index = 0, length = items.length; index < length; index++) {
			let item = items[index];
			let view = this._removeItem(item);
			view && destroy.push(view);
		}
		return destroy;
	},

	_removeItem(item){
		let model = item instanceof Backbone.Model ? item : item.model;
		let context = this._store.byModel[model.id] || this._store.byModel[model.cid];
		delete this._store.byModel[model.id];
		delete this._store.byModel[model.cid];
		return context.view;
	},

	_getModelView(model){
		let id = model.id == null ? model.cid : model.id;
		let context = this._store.byModel[id];
		return context && context.view;
	},

	_getModelContext(model, { create, markNew } = {}){
		let id = model.id == null ? model.cid : model.id;
		let context = this._store.byModel[id];
		if (context) { return context; }
		if (create) {
			context = { model, isCollection: true };
			markNew && (context.isNew = true);
			return context;
		}
	},

	_storeContext(context){
		let id = context.model.id;
		context.isNew && (delete context.isNew);
		if(id != null)
			this._store.byModel[id] = context;
		this._store.byModel[context.model.cid] = context;
	},

	_initView(context){
		if(context.view && !context.view._isDestroyed)
			return;
		context.view = this.createView(context.model);
	},

	_updateIndexes(){

		let models = this.collection.models;
		for (let index = 0, length = models.length; index < length; index++) {
			let model = models[index];
			let id = model.id == null ? model.cid : model.id;
			let context = this._store.byModel[id];
			context && (context.index = index);
		}
	},


};
