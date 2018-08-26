import { isView, isViewClass } from '../../vendors/helpers';
import result from '../../utils/better-result';

export default {

	getCustoms(){
		return this._store.customs;
	},
	addCustomView(arg, index){		
		let customContext = this._normalizeAddCustomContext(arg, index);
		if (!customContext) { return; }
		this._store.customs.push(customContext);
	},
	removeCustomViews(){
		let customs = this.getCustoms() || [];
		_.each(customs, custom => {
			if(!custom.view) return;
			if(custom.rebuild)
				this._destroyChildView(custom.view);
			else
				this._detachChildView(custom.view);
		});
	},

	_extractCustomView(arg, custom = {}){
		if (
			custom.condition === false
			||
			(_.isFunction(custom.condition) && custom.condition.call(this.view, this.view, arg) === false)
		) return;
		
		if (isView(arg) && !arg._isDestroyed) {
			return arg;
		} else if (_.isFunction(custom.build)) {
			if(isView(custom.view) && !custom.view._isDestroyed){
				this._destroyChildView(custom.view);
				// custom.view.destroy();
				// this.stopListening(custom.view);
			}
			custom.view = custom.build();
			return custom.view;
		}
	},

	_injectCustoms(items){

		if (!items.length) {
			items = [];
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
		if (isView(arg) && !arg._isDestroyed) {
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
		} else if (_.isObject(arg) && !isView(arg)) {
			if (arg.build == null && arg.view == null) { return; }
			if (index != null)
				arg.index = index;

			if (_.isFunction(arg.view)) {
				let viewFn = arg.view;
				delete arg.view;
				let options = arg.options;
				if(isViewClass(viewFn)){
					arg.build = () => new viewFn(result({ options }, 'options', { context: this.view }));
				} else {
					arg.build = () => viewFn.call(this.view, result({ options }, 'options', { context: this.view }));
				}
			}

			if (arg.rebuild == null) {
				arg.rebuild = !isView(arg.view);
			}
			return arg;
		}
	}	
};
