import MnObject from '../../../mn/object';
import mix from '../../../utils/mix';
import GetOptionMixin from '../../../mixins/common/get-option';
import StartableMixin from '../../../mixins/common/startable';
import ChildrenableMixin from '../../../mixins/common/childrenable';
import RoutesMixin from './routes-mixin';

const BasePage = mix(MnObject).with(GetOptionMixin, ChildrenableMixin, StartableMixin, RoutesMixin);

export default BasePage.extend({
	constructor(opts = {}){
		BasePage.apply(this, arguments);

		this.mergeOptions(opts, ['root','parent','router','canNotStart','onStart','onBeginStart', 'onBeforeStart', 'onEndStart', 'onStop', 'onBeginStop', 'onBeforeStop', 'onEndStop']);
		
		// resides in routes-mixin
		this.initializeRoutes();

		// resides in ChildrenableMixin
		this.initializeChildren();
		
		// resides in routes-mixin
		this.registerAllRoutes();
	},

	getLabel(){
		let result = this.getOption('label', { args: [this, this.model]});
		return result;
	},
	getMenuLabel(){
		let result = this.getOption('menuLabel', { args: [this, this.model], default: this.getLabel()});
		return result;
	},

	buildChildOptions(options){
		return _.extend({
			root: this.root,
			parent: this.parent,
			router: this.router,
		}, options);
	},

	getSiblings(opts = {}){
		let parent = this.getParent();
		let options = _.extend({ exclude: [this] }, opts);
		return parent && parent.getChildren(options) || [];
		// if(_.isFunction(opts.map))
		// 	return _(pages).chain().map(opts.map).filter(f => !!f).value();
		// else
		// 	return pages;
	},
	getChildrenHashes(){
		return this.getChildren({ map: i => i.getHash(), visible: true, });
	},
	getSiblingsHashes(){
		return this.getSiblings({ map: i => i.getHash(), visible: true, });
	},

	getAllPages(opts = {}){
		
		let options = _.extend({}, opts, { includeSelf: true });
		delete options.map;
		let pages = this.root.getAllChildren(options);

		if (_.isFunction(opts.map)) {
			return _(pages).chain().map(opts.map).filter(f => !!f).value();
		} else {
			return pages;
		}
	},
	getAllHashes(opts = {}){
		let options = _.extend({ map: i => i.getHash(), visible: true, }, opts);
		return this.getAllPages(options);
	},
	getHash(){
		let context = this.getMainRouteContext();

		if(!_.isObject(context))
			return;

		let parent = this.getParent();
		let parentCid = parent && parent.cid || undefined;		
		return {
			cid: this.cid,
			parentCid,
			url: context.route,
			label: this.getMenuLabel(),
			order: this.order,
		};
	},


	_childFilter(item, index, opts = {}) {

		if(!BasePage.prototype._childFilter.apply(this, arguments))
			return;

		let { visible } = opts;

		if(visible && (!item.visible || item.hidden))
			return;

		return item;
	},

});

