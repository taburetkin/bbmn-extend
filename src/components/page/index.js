import MnObject from '../../mn/object';
import mix from '../../utils/mix';
import GetOptionMixin from '../../mixins/common/get-option';
import StartableMixin from '../../mixins/common/startable';
import ChildrenableMixin from '../../mixins/common/childrenable';

const BasePage = mix(MnObject).with(GetOptionMixin, ChildrenableMixin, StartableMixin);
export default BasePage.extend({
	constructor(opts = {}){
		BasePage.apply(this, arguments);
		this.mergeOptions(opts, 'root, parent');		
		//this.initializeRoutes();
	},
});
