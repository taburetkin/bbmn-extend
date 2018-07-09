import triggerControlEvent from './trigger-control-event';
import getTriggerValue from './get-trigger-value';
import getOption from './get-option';

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
		if (eventName in events) {
			events[eventName].apply(this, args);
		}
	},

	triggerControlChange(){
		this._triggerControlEvent('change', arguments);
	},
	triggerControlDone(){
		this._triggerControlEvent('done', arguments);
	},
	_triggerControlEvent(eventName, args){
		let triggerValue = getTriggerValue(this, args);
		let errors = this.tryValidateControl(triggerValue);
		if (!errors) {
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



});
