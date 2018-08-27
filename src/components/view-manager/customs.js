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
		if(isView(customContext.view) && !customContext.view._isDestroyed) {
			this._setupJustCreatedView(customContext.view, customContext);
		}
	},
	removeCustomViews(){
		let customs = this.getCustoms() || [];
		_.each(customs, custom => {
			if(!custom.view) return;
			
			if(this._checkCustomCondition(custom.view, custom)) { return; }

			if (custom.rebuild)
				this._destroyChildView(custom.view);
			else
				this._detachChildView(custom.view);
		});
	},

	_checkCustomCondition(customView, custom){
		
		if (this.enableFilterForCustomViews) {
			let filter = this.getFilter();
			return !filter || filter(customView);
		}

		if (_.isFunction(custom.condition)) {
			return custom.condition.call(this.view, customView, this.view);
		} else if(custom.condition != null){
			return custom.condition;
		} else {
			return true;
		}

	},
	_injectCustoms(items, detached, destroyed){

		if (this.collection && !items.length) {
			items = [];
			this._injectEmptyView(items);
		}

		let customs = this.getCustoms() || [];

		if(!customs.length)
			return items;

		let newitems = items.slice(0);
		_.each(customs, custom => {

			let view = this._ensureContextHasView(custom);
			if(!view) return;

			if(!this._checkCustomCondition(view, custom)){
				// if (custom.rebuild) {
				// 	destroyed.push(view);
				// } else {
				// }
				detached.push(custom);
				return;
			}

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
