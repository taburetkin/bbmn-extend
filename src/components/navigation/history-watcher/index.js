import { history, historyNavigate }  from '../history/index.js';
import { Events } from '../../../vendors/backbone.js';


export default _.extend({
	watch(){
		this.entries = [];
		this.listenTo(history, 'route', this.onRoute);
		this.listenTo(history, 'backroute', this.onBackRoute);
	},
	isActionContext: cntx => _.isObject(cntx) && _.isString(cntx.fragment),
	hasElements(){
		return this.entries.length > 0;
	},
	onRoute(actionContext){

		if(!this.isActionContext(actionContext))
			return;

		if (this.isActionContext(this.lastElement)) {
			this.entries.push(this.lastElement);
		}
		this.lastElement = actionContext;

	},
	onBackRoute(actionContext){
		if(!this.isActionContext(actionContext) || !this.isActionContext(actionContext.gobackContext))
			return;

		let lookFor = actionContext.gobackContext;
		let index = this.entries.indexOf(lookFor);
		if (index >= 0) {
			this.entries = this.entries.slice(0, index);
			this.lastElement = lookFor;
		}

	},
	goBack(){
		let last = this.hasElements() && _(this.entries).last();
		historyNavigate(last.fragment, { trigger: true, routeType: 'backroute', gobackContext: last });
	},
}, Events);
