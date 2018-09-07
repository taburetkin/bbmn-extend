import triggerControlEvent from './trigger-control-event';
import getTriggerValue from './get-trigger-value';
//import getOption from '../../../utils/get-option';
//import camelCase from '../../../utils/camel-case';

import { compareObjects, getOption, setByPath, flat, unflat } from '../../../utils/index.js';

export default Base => Base.extend({	
	isControl: true,
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
	setControlValue(value, { key, trigger = true, notValidated, proxyEvent } = {}){
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
		
		this._notValidatedValue = newvalue;
		let alwaysUpdateValue = this.getOption('alwaysUpdateValue');

		if (notValidated) {
			return Promise.resolve(this._notValidatedValue);
		}

		return this.validate({ proxyEvent, key }).then(
			(value) => {
				this._previousValue = this.value;
				this.value = value;
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

	validate(options = {}){
		
		let value, fullValue;
		value = this._notValidatedValue;
		fullValue = this.getFullValue({ notValidated: true });

		let validate = getOption(this, 'validateControl', { force: false });
		let validateResult = _.isFunction(validate) && validate.call(this, value, fullValue, this) || undefined;

		return this._validatePromise(validateResult, value, options);

	},
	_validatePromise(promise, value, options){
		if (!promise) {
			promise = Promise.resolve(value);
		} else if (promise && !_.isFunction(promise.then)) {
			promise = Promise.reject(promise);
		}

		if(!_.isFunction(promise.then)) {
			throw new Error('_validatePromise resolved not in promise');
		}

		return promise.then(() => {
			this._validateSuccess(value, options);
		}, error => {
			return this._validateError(error, value, options);
		});
	},
	_validateSuccess(value, { proxyEvent } = {}){
		this._isInvalid = false;
		triggerControlEvent(this, 'valid', { proxyEvent, args: [value] });
	},
	_validateError(error, value, options = {}){
		this._isInvalid = true;
		this.triggerControlInvalid(error, value, options);
		return Promise.reject(error);
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
		let opts = {
			args:[triggerValue]
		};
		triggerControlEvent(this, eventName, opts);
	},
	triggerControlChange(){
		this._triggerControlEvent('change', arguments);
	},
	triggerControlDone(){
		this._triggerControlEvent('done', arguments);
	},
	triggerControlInvalid(errors, value, opts = {}){
		let args = [errors, value];
		if ('fullValue' in opts) {
			args.push(opts.fullValue);
		}
		let options = _.extend({}, opts, { args });
		triggerControlEvent(this, 'invalid', options);
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
