import triggerControlEvent from './trigger-control-event';
import getTriggerValue from './get-trigger-value';
import getOption from '../../../utils/get-option';
import camelCase from '../../../utils/camel-case';

export default Base => Base.extend({	

	getControlValue(){
		return this.value;
	},
	setControlValue(value){
		this.value = value;
	},

	getControlName(){
		return getOption(this, 'controlName', { args:[this]}) || 'control';
	},

	getParentControl(){
		return getOption(this, 'proxyTo', { args:[this]});
	},
	triggerChildControlEvent(eventName, ...args){
		let events = getOption(this, 'childControlEvents', { args:[this]}) || {};
		if (_.isFunction(events[eventName])) {
			events[eventName].apply(this, args);
		}
	},

	tryValidateControl(value){
		let validate = getOption(this, 'validateControl', { force: false });
		if(_.isFunction(validate))
			return validate.call(this, value, this);
	},

	triggerControlChange(){
		this._triggerControlEvent('change', arguments);
	},
	triggerControlDone(){
		this._triggerControlEvent('done', arguments);
	},
	_isValueAsPrevious(value, type){
		let previousTriggerName = this.getPreviousTriggerValueKey(type);
		if (previousTriggerName in this) {
			return JSON.stringify(this[previousTriggerName]) === JSON.stringify(value);
		}
	},
	isValueAsPrevious(value, type)
	{
		return this._isValueAsPrevious(value, type);
	},
	setPreviousTriggerValue(value, type){
		let key = this.getPreviousTriggerValueKey(type);
		this[key] = value;
	},
	getPreviousTriggerValueKey(type){
		return camelCase('_previous:' + type);
	},
	_triggerControlEvent(eventName, args) {

		let triggerValue = getTriggerValue(this, args);
		if (this.isValueAsPrevious(triggerValue, eventName)) {
			return;
		}
		let errors = this.tryValidateControl(triggerValue);
		if (!errors) {
			this.setPreviousTriggerValue(triggerValue, eventName);			
			triggerControlEvent(this, eventName, triggerValue);
		} else {
			this.triggerControlInvalid(errors);
		}
	},
	triggerControlInvalid(errors){
		triggerControlEvent(this, 'invalid', errors);
	},
	proxyControlEventToParent(eventName, ...args){
		let parent = this.getParentControl();
		if (parent && _.isFunction(parent.triggerChildControlEvent)) {
			parent.triggerChildControlEvent(eventName, ...args);
		}
	},



}, {
	ControlMixin: true
});
