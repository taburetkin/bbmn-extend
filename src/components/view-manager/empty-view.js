import { isViewClass } from '../../vendors/helpers';

const EmptyViewMixin = {
	removeEmptyViewInstance(opts = {}){
		let view = this._emptyViewInstance;
		if (!view) return;
		let { destroy = []} = opts;
		if (view) {
			delete this._emptyViewInstance;
			destroy.push(view);
			opts.destroy = destroy;
		}
	},
	_getEmptyViewClas(){
		if (!this.emptyView) { return; }
		else if(isViewClass(this.emptyView)){
			return this.emptyView;
		} else if(_.isFunction(this.emptyView)) {
			return this.emptyView.call(this.view);
		}
	},
	_injectEmptyView(items){
		let View = this._getEmptyViewClas();
		if (!View) return;
		let options = _.extend({}, this.emptyViewOptions);
		let view = new View(options);
		this._emptyViewInstance = view;
		items.push({ view });
	},
	_removeEmptyViewInstance({ destroy = [] } = {}){
		let view = this._emptyViewInstance;
		if (!view) return;

		if (view) {
			delete this._emptyViewInstance;
			destroy.push(view);
		}
	},	
};
export default EmptyViewMixin;
