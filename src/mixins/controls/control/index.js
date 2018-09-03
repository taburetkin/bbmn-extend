import triggerControlEvent from './trigger-control-event';
import getTriggerValue from './get-trigger-value';
//import getOption from '../../../utils/get-option';
//import camelCase from '../../../utils/camel-case';

import { compareObjects, mergeObjects, getOption, camelCase, setByPath } from '../../../utils/index.js';

export default Base => Base.extend({	

	initializeValues(){
		let value = this.getOption('value', {deep: false, force: false});
		this.setInitialValue(value);
		this.setControlValue(value, { trigger: false });
	},
	getControlValue(){
		return this.value;
	},
	getInitialValue(){
		return this.initialValue;
	},
	setInitialValue(value){
		this.initialValue = value;
	},
	prepareValueBeforeSet(value){ return value; },
	setControlValue(value, { key, trigger = true } = {}){
		let newvalue = _.clone(this.value);
		value = this.prepareValueBeforeSet(value);
		if (key == null) {
			newvalue = value;
		} else {
			setByPath(newvalue, key, value);
		}
		let same = compareObjects(this.value, newvalue);
		if (same) { return; }

		let errors = this._validateControl(newvalue);
		// if (errors) {
		// 	this._previousValue = newvalue;
		// 	return;
		// }

		this._previousValue = this.value;
		this.value = newvalue;

		!errors && trigger && this.triggerControlChange();

		return this.value;
	},

	isValid(){
		return this._isInvalid === false;
	},

	_validateControl(value){
		let validate = getOption(this, 'validateControl', { force: false });
		let errors;
		if (_.isFunction(validate)) {
			errors = validate.call(this, value, this);
		}
		if (errors) {
			this._isInvalid = true;
			this.triggerControlInvalid(errors);
		} else {
			this._isInvalid = false;
		}
		return errors;
	},


	getControlName(){
		return getOption(this, 'controlName', { args:[this]}) || 'control';
	},

	getParentControl(){
		return getOption(this, 'proxyTo', { args:[this]});
	},

	handleChildControlEvent(eventName, ...args){
		let events = getOption(this, 'childControlEvents', { args:[this]}) || {};
		if (_.isFunction(events[eventName])) {
			events[eventName].apply(this, args);
		}
	},

	_triggerControlEvent(eventName, args) {
		let triggerValue = getTriggerValue(this, args);
		triggerControlEvent(this, eventName, triggerValue);
	},
	triggerControlChange(){
		this._triggerControlEvent('change', arguments);
	},
	triggerControlDone(){
		this._triggerControlEvent('done', arguments);
	},
	triggerControlInvalid(errors){
		triggerControlEvent(this, 'invalid', errors);
	},

	/*
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
	*/

	proxyControlEventToParent(eventName, ...args){
		let parent = this.getParentControl();
		if (!parent) return;

		this.handleChildControlEvent.call(parent, eventName, ...args);

	},



}, {
	ControlMixin: true
});
