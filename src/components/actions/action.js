import extend from '../../utils/extend/index.js';
import getByPath from '../../utils/get-by-path/index.js';

const Action = function(options = {}){
	let { name, action } = options;
	this.options = _.omit(options, 'name', 'callback');
	this.name = name;
	this._action = action;
};
Action.extend = extend;
_.extend(Action.prototype, {
	getOption(key){
		return getByPath(this.options, key);
	},
	getLabel(){ return this.name; },
	getAction() {
		return this._action;
	},
	exec(instance, ...args){
		let decline = this.isNotAllowed(instance, args);
		if (decline) {
			return this.onExecuteNotAllowed(instance, decline, args);
		}
		let action = this.getAction();

		if (_.isFunction(action)) {
			return action.apply(instance, args);
		}
		else {
			return this.onActionMissing(instance);
		}
	},
	is (arg) { return this == arg || this.name == arg; },
	isVisible () { return this.hidden !== true; },
	isNotAllowed () { },
	onExecuteNotAllowed () { },
	onActionMissing () { },
});

export default Action;
