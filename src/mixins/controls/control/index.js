import triggerControlEvent from './trigger-control-event';
import getTriggerValue from './get-trigger-value';
//import getOption from '../../../utils/get-option';
//import camelCase from '../../../utils/camel-case';

import { compareObjects, getOption, setByPath, flat, unflat } from '../../../utils/index.js';

export default Base => Base.extend({	
	constructor(options){
		if (options.controlName != null) {
			this.controlName = options.controlName;
		}
		Base.apply(this, arguments);
	},
	initializeValues(){
		let value = this.getOption('value', {deep: false, force: false});
		this.setInitialValue(value);
		this.setControlValue(value, { trigger: false });
	},
	getControlValue({ notValidated } = {}){
		if (notValidated) {
			return this._notValidatedValue || this.value;
		}
		return this.value;
	},
	getInitialValue(){
		return this.initialValue;
	},
	setInitialValue(value){
		this.initialValue = value;
	},
	prepareValueBeforeSet(value){ return value; },
	setControlValue(value, { key, trigger = true, notValidated, fullValue } = {}){
		let newvalue = this.getControlValue({ notValidated });
		if(_.isObject(newvalue)){
			newvalue = unflat(flat(newvalue));
		}
		value = this.prepareValueBeforeSet(value);
		if (key == null) {
			newvalue = value;
		} else {
			setByPath(newvalue, key, value);
		}
		let same = compareObjects(this.value, newvalue);
		if (same) { return; }

		let alwaysUpdateValue = this.getOption('alwaysUpdateValue');
		this._notValidatedValue = newvalue;

		if (notValidated) {
			return Promise.resolve(this._notValidatedValue);
		}

		return this.validate(newvalue, fullValue).then(
			() => {
				this._previousValue = this.value;
				this.value = newvalue;
				trigger && this.triggerControlChange();
				return Promise.resolve(this.value);
			},
			() => {
				alwaysUpdateValue && (this.value = newvalue);
			}
		);
	},

	isValid(){
		return this._isInvalid === false;
	},

	validate(value, fullValue){
		
		if (arguments.length === 0) {
			value = this.getControlValue({ invalid: true });
			fullValue = this.getFullValue({ notValidated: true });
		}
		let validate = getOption(this, 'validateControl', { force: false });
		let validateResult;
		
		if (_.isFunction(validate)) {
			validateResult = validate.call(this, value, fullValue, this);
		}
		if (validateResult == null) {
			this._isInvalid = false;
			return Promise.resolve();
		} else {
			if (_.isFunction(validateResult.then)) {
				return validateResult.then(
					() => {
						this._isInvalid = false;
					},
					errors => {
						this._isInvalid = true;
						this.triggerControlInvalid(errors, value, fullValue);
						return Promise.reject(errors);
					}
				);
			} else {
				this._isInvalid = true;
				this.triggerControlInvalid(validateResult, value, fullValue);
				return Promise.reject(validateResult);
			}
		}
	},


	getControlName(){
		return getOption(this, 'controlName', { args:[this]}) || 'control';
	},

	getParentControl(){
		return getOption(this, 'proxyTo', { args:[this]});
	},
	getFullValue({ notValidated } = {}){
		let parent = this.getParentControl();
		if (!parent || !parent.getControlValue) {
			return;
		}
		return parent.getControlValue({ notValidated });
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
	triggerControlInvalid(errors, value, fullValue){
		triggerControlEvent(this, 'invalid', errors, value, fullValue);
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
