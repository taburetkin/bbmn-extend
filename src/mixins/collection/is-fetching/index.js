export default Collection => Collection.extend({
	constructor(){
		
		this.on({
			request(){
				this._isFetching = true;
			},
			sync(){
				this._isFetching = false;
				this._isFetched = true;
			}
		});
		
		Collection.apply(this, arguments);
	},
	isFetching(){
		return this._isFetching === true;
	},
	isFetched(){
		return this._isFetched === true;
	}
});
