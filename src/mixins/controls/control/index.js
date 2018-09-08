import { flat, unflat, setByPath, compareObjects, betterResult } from '../../../utils/index.js';

function takeValue(key, first = {}, second = {}){
	if(!_.isObject(first) || !_.isString(key)) return;
	if (key in first) {
		return first[key];
	} else {
		return second[key];
	}
}

function getTriggerMethod(context){
	if(!context) { return () => {}; }
	return _.isFunction(context.triggerMethod) ? context.triggerMethod
		: _.isFunction(context.trigger) ? context.trigger
			: () => {};
}

function ensureError(error, value){
	if(error instanceof Error){
		throw error;
	}
	return arguments.length > 1 ? value : error;
}


export default Base => Base.extend({

	isControl: true,
	constructor(options){		
		this._initControl(options);
		Base.apply(this, arguments);
		if (this.getOption('validateOnReady')) {
			this.once('control:ready', () => {
				this.validate().catch(() => {});
			});
		}
	},
	_onControlDestroy(){
		let parent = this.getParentControl();
		if (parent && _.isFunction(parent._removeChildControl)) {
			parent._removeChildControl(this);
		}
		let children = this.getChildrenControls();
		if (children) {
			_.each(children, child => child._removeParentControl());
			children.length = 0;
		}
		delete this._cntrl;
	},
	_removeChildControl(control){
		this.off(control);
		let children = this.getChildrenControls();
		if (!children.length) { return; }
		let index = children.indexOf(control);
		if (index === -1) return;
		children.splice(index, 1);
	},
	_addChildControl(control){
		let children = this.getChildrenControls();
		children.push(control);
		// this.listenTo(control, 'control:invalid', (error) => {
		// 	this._onControlValidateFail(error, this.getControlValue({ notValidated: true })).catch(() => {});
		// });
	},
	_removeParentControl(){
		delete this._cntrl.parent;
	},
	_initControl(options = {}){
		if (this._controlInitialized) { return; }

		this._cntrl = {};
		let name = takeValue('controlName', options, this) || 'control';
		this._cntrl.name = name;

		let value = takeValue('value', options, this);
		value = this._clone(value);
		this.initControlValue(value);
		this.initParentControl(options);

		this.once('destroy', this._onControlDestroy);

		this._controlInitialized = true;
	},
	initParentControl(options){
		let parent = takeValue('proxyTo', options, this) || takeValue('parentControl', options, this);
		this._cntrl.parent = parent;
		if (parent && _.isFunction(parent._addChildControl)) {
			parent._addChildControl(this);
		}
	},
	initControlValue(value){
		this._cntrl.initial = value;
		this.setControlValue(value, { silent: true });
	},
	getControlName(){
		return this._cntrl.name;
	},

	isSameControlValue(value){
		let current = this.getControlValue();
		return this.isValid() && compareObjects(current, value);
	},
	getControlValue({ notValidated, clone } = {}){
		let key = notValidated ? 'notValidated' : 'value';
		let value = this._cntrl[key];
		return clone ? this._clone(value) : value;
	},
	setControlValue(value, options = {}){
		let  { key, notValidated } = options;
		value = this._prepareValueBeforeSet(value, { key });
		const resolve = Promise.resolve(value);
		if (this.isSameControlValue(value)) { return resolve; }

		this._cntrl.notValidated = value;

		if (notValidated) { return resolve; }
		return this._setControlValue(value, options);
	},
	_prepareValueBeforeSet(value, { key } = {}){
		value = this.prepareValueBeforeSet(value);
		if (key == null) { return value; }

		let current = this.getControlValue({ notValidated: true, clone: true }) || {};
		setByPath(current, key, value);
		return current;
	},

	//override this if you need modify value before set
	prepareValueBeforeSet: value => value,

	_setControlValue(value, options = {}) {
		let { skipValidation } = options;
		if (skipValidation) {
			return this._onSetControlValueValidateSuccess(value, options);
		}
		return this._validate(value, options)
			.then(
				value => this._onSetControlValueValidateSuccess(value, options), 
				error => this._onSetControlValueValidateFail(error, value, options)
			);
	},
	_onSetControlValueValidateSuccess(value, options){
		this._cntrl.previous = this._cntrl.value;
		this._cntrl.value = value;
		this._cntrl.isDone = false;
		this._tryTriggerEvent('change', [value], options);
		return Promise.resolve(value);
	},
	_onSetControlValueValidateFail(error, value, options){
		this._tryTriggerEvent('change:fail', [value, error], options);
		return ensureError(error, value);
	},

	isValid(){
		return this._cntrl.isValid !== false;
	},
	validate(options){
		let notValidated = !this.isValid();
		let value = this.getControlValue({ notValidated });
		return this._validate(value, options);
	},
	_validate(value, options){
		let validator = this.getControlValidator(options);
		let validate = validator(value, options);
		return validate.then(
			value => this._onControlValidateSuccess(value, options),
			error => this._onControlValidateFail(error, value, options)
		);
	},
	_defaultControlValidator(value, options, validate, promises = []){
		let values = this.getParentControlValue({ notValidated: true });
		let validateResult = _.isFunction(validate) && validate.call(this, value, values, options) || undefined;
		let promise = Promise.resolve(value);
		if (validateResult && validateResult.then) {

			promise = validateResult;

		} else if(validateResult) {

			promise = Promise.reject(validateResult);

		}

		return Promise.all(promises).then(() => promise);
	},
	getControlValidator({ skipChildValidate } = {}){
		let validate = this.getOption('controlValidate', { force: false });
		let children = this.getChildrenControls();
		let promises = _.map(children, child => {
			if (!child.validate || (skipChildValidate && child.getControlName() == skipChildValidate)) {
				return;
			}
			return child.validate({ stopPropagation: true });
		});
		return _.bind(_.partial(this._defaultControlValidator, _, _, validate, promises), this);
	},

	_onControlValidateSuccess(value, options){
		this.makeValid(value, options);
		return Promise.resolve(value);
	},
	makeValid(value, options){
		this._cntrl.isValid = true;
		this._tryTriggerEvent('valid', [value], options);
	},

	_onControlValidateFail(error, value, options){
		this.makeInvalid(error, value, options);
		return Promise.reject(error);
	},
	makeInvalid(error, value, options){
		this._cntrl.isValid = false;
		this._tryTriggerEvent('invalid', [value, error], options);
	},

	getParentControl() {
		return this._cntrl.parent;
	},
	getParentControlValue(options) {

		let parent = this.getParentControl();
		if (!parent || !_.isFunction(parent.getControlValue)) {
			return;
		}
		if (betterResult(parent, 'isControlWrapper', { args:[this]})) {
			return parent.getParentControlValue(options);
		} else {
			return parent.getControlValue(options);
		}
	},
	getChildrenControls(){
		if(!this._cntrl.children) {
			this._cntrl.children = [];
		}
		return this._cntrl.children;
	},
	handleChildControlEvent(event, controlName, ...args) {
		let childEvent = controlName + ':' + event;
		let trigger = getTriggerMethod(this);
		trigger.call(this, childEvent, ...args);

		let cce = this.getOption('childControlEvents', { args: [this] }) || {};
		let def = this.defaultChildControlEvents || {};
		let handler = cce[childEvent];
		if (_.isFunction(handler)) {
			handler.apply(this, args);
		} else {
			let defHandler = def[event];
			_.isFunction(defHandler) && defHandler.call(this, controlName, ...args);
		}
	},
	defaultChildControlEvents:{
		'change'(controlName, value){
			let isControlWraper = this.getOption('isControlWrapper');
			isControlWraper && (controlName = undefined);
			this.setControlValue(value, { key: controlName, skipChildValidate: controlName });
		},
		'done'(controlName, value){
			let isControlWraper = this.getOption('isControlWrapper');
			isControlWraper && (controlName = undefined);
			this.setControlValue(value, { key: controlName, skipChildValidate: controlName });
		},
		'invalid'(controlName, value, error){
			let isControlWraper = this.getOption('isControlWrapper');
			isControlWraper && (controlName = undefined);
			this.setControlValue(value, { key: controlName, silent: true });
			this.makeInvalid(error);
		},
	},

	controlDone(){
		if (!this._cntrl.isValid || this._cntrl.isDone) { return; }
		let value = this.getControlValue();
		this._cntrl.isDone = true;
		this._tryTriggerEvent('done', [value]);
	},


	/*
		helpers
	*/
	_clone(value){
		if(_.isArray(value))
			return value.slice(0);
		else if(_.isObject(value)) {
			return unflat(flat(value));
		} else
			return value;
	},
	_tryTriggerEvent(name, args = [], { silent, stopPropagation } = {}){
		if (silent) { return; }
		let controlName = this.getControlName();
		let event = 'control:' + name;
		let namedEvent = controlName + ':' + name;

		let trigger = getTriggerMethod(this);
		
		trigger.call(this, event, ...args);

		let parent = this.getParentControl();
		if (stopPropagation || !parent) { return; }
		if (_.isFunction(parent.handleChildControlEvent)) {
			parent.handleChildControlEvent(name, controlName, ...args);
		} else {
			let parentTrigger = getTriggerMethod(parent);
			parentTrigger.call(this, namedEvent, ...args);
		}

	},
	makeControlReady(){
		let trigger = getTriggerMethod(this);
		trigger.call(this, 'control:ready');
	},
	isControlWrapper(){
		return this.getOption('isControlWrapper') === true;
	}
});
