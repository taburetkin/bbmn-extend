export default {
	_ensureOptions(){
		if(!this.view)
			throw new Error('view is not set');

		if(!this.$container){
			this.$container = this.view.$el;
		}

	},
	getPaginator(){
		let skip = this.skip || 0;
		let take = this.take || Infinity;
		!_.isNumber(skip) || skip < 0 && (skip = 0);
		!_.isNumber(take) || take < 0 && (take = Infinity);
		if(skip == 0 && take == Infinity)
			return;
		else
			return {
				from: skip,
				to: skip + take
			};
	},
	_dataComparator(a, b){
		return a.index - b.index;
	},	
	getComparator(){
		return this.dataComparator;
	},
	setComparator(comparator, {preventRender} = {}){

		if(this.dataComparator == comparator) return;

		this.dataComparator = comparator;
		this._store.isSorted = false;

		if(!preventRender)
			this.processAndRender();
	},
	getFilter(){
		return this.dataFilter;
	},
	setFilter(filter, {preventRender} = {}){
		if(this.dataFilter == filter) return;

		this.dataFilter = filter;
		this._store.isFiltered = false;
		if(!preventRender)
			this.processAndRender();
	},
};
