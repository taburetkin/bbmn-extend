import { isView, isViewClass } from '../../vendors/helpers';


export default {

	getCustoms(){
		return this._store.customs;
	},
	addCustomView(arg, index){		
		let customContext = this._normalizeAddCustomContext(arg, index);
		if (!customContext) { return; }
		this._store.customs.push(customContext);
	},


	_extractCustomView(arg, custom = {}){
		if(isView(arg) && !arg._isDestroyed) {
			return arg;
		} else if(_.isFunction(custom.build)) {
			custom.view = custom.build();
			return custom.view;
		}
	},

	_injectCustoms(items){

		if (!items.length) {
			this._injectEmptyView(items);
		}

		let customs = this.getCustoms() || [];

		if(!customs.length)
			return items;

		let newitems = items.slice(0);
		_.each(customs, custom => {
			let view = this._extractCustomView(custom.view, custom);
			if(!view) return;
			if(custom.index == null){
				newitems.push(custom);
			} else {
				newitems.splice(custom.index, 0, custom);
			}
		});
		return newitems;
	},

	_normalizeAddCustomContext(arg, index){
		if(isView(arg)){
			return {
				view: arg,
				rebuild: false,
				index
			};
		} else if (_.isFunction(arg) && isViewClass(arg)){
			return {
				build: () => new arg(),
				index,
				rebuild: true,
			};
		} else if(_.isFunction(arg)) {
			return {
				build: arg,
				index,
				rebuild: true,
			};
		} else if (_.isObject(arg)) {
			if(index != null)
				arg.index = index;
			arg.rebuild = !(arg.view instanceof Backbone.View);
			return arg;
		}
	}	
};
