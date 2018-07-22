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

	},
	// startOptions:{
	// 	onBegin(){

	// 	}
	// },
	buildChildOptions(options){
		return _.extend({
			root: this.root,
			parent: this.parent,
			router: this.router,
		}, options);
	},
});

