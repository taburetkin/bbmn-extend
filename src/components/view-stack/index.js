import { Events } from '../../vendors/backbone.js';
import { getOption, triggerMethod } from '../../utils/index.js';
//import { triggerMethod } from '../../vendors/helpers';
const ViewStack = function(options = {}){
	this.cid = _.uniqueId('stack');
	this.unremovableKey = `_${this.cid}_preventRemove`;
	this.destroyOnRemove = true;
	this.removeOnEsc = true,
	this.removeOnOutsideClick = true,
	this.options = options;
	this.stack = [];
};
_.extend(ViewStack.prototype, Events, {


	add(view, options){
		if(!_.isObject(view)) { return; }
		
		this.triggerMethod('before:add');

		this.stack.push(view);
		this._setupView(view, options);

		this._stackChanged(1, view);

	},
	_setupView(view, { preventRemove } = {}){
		if (preventRemove) {
			let key = this.getUnremovableKey();
			view[key] = true;
		}
		this.listenToOnce(view, 'destroy', () => this._removeView(view, { selfDestroy: true }));		
	},
	remove(view, { destroy } = {}){
		let destroyOnRemove = this.getOption('destroyOnRemove');
		let removed = this._removeView(view);
		if (removed && (destroy || destroyOnRemove)) {
			this._destroyView(view);
		}
	},
	getLast(){
		return _.last(this.stack);
	},
	removeLast(){
		let view = this.getLast();
		this.remove(view);
	},
	destroyLast(){
		let view = this.getLast();
		this.remove(view, { destroy: true });
	},


	_removeView(view, { selfDestroy } = {}){
		if (!_.isObject(view)) { return; }

		if (this.isViewUnremovable(view, selfDestroy)) {
			return;
		}

		this._cleanUpView(view);

		let index = this.stack.indexOf(view);
		if (index === -1) return;

		if (index == this.stack.length - 1)
			this.stack.pop();
		else
			this.stack.splice(index, 1);
			
		this._stackChanged(-1);

		return view;
	},
	_cleanUpView(view){
		this.stopListening(view);
		delete view[this.getUnremovableKey()];
	},
	_destroyView(view) {
		if (_.isObject(view) && _.isFunction(view.destroy)) { 
			view.destroy();
		}
	},	
	_stackChanged(change, view){
		if (change > 0) {
			this._setDocumentListeners();			
			this.triggerMethod('add', view);
		} else {
			this._unsetDocumentListeners();			
			this.triggerMethod('remove', view);
		}

	},


	/*
		Unremovable view methods
		sometimes you want to prevent view to be removed from the stack		
	*/
	getUnremovableKey(){
		return this.getOption('unremovableKey');
	},
	// options is for internal use only.
	// self destroy flag filled when a view destroyed outside the stack
	isViewUnremovable(view, { selfDestroy }={}){
		if (selfDestroy) return false;
		let key = this.getUnremovableKey();
		return view[key];
	},	


	/*
		DOM listeners logic
		- esc handler
		- outside click handler
	*/
	getViewDomElement(view){
		return view && view.el;
	},
	isElementOutsideOfView(eventElement, view){
		let viewElement = this.getViewDomElement(view);
		if (!viewElement) return;
		return !$.contains(viewElement, eventElement);
	},
	getViewIfElementOutside(eventElement){
		let view = this.getLast();
		if (!view) return;
		if(this.isElementOutsideOfView(eventElement, view)) {
			return view;
		}
	},
	outsideClickHandler(event){
		if (!this.stack.length) { return; }

		let view = this.getViewIfElementOutside(event.target);
		if (!view) { return; }

		event.preventDefault();
		event.stopPropagation();
		this.remove(view);

	},
	escapePressHandler(event){
		if (!this.stack.length || event.keyCode !== 27 ) return;

		event.preventDefault();
		event.stopPropagation();
		this.removeLast();

	},

	_setDocumentListeners(){
		if (this._documentListeners || !this.stack.length) return;
		let $doc = this.getDocument();
		if (this._shouldRemoveOnEsc()) {			
			this._escapePressHandler = _.bind(this.escapePressHandler, this);
			$doc.on('keyup', this._escapePressHandler);
			this.triggerMethod('dom:listeners:escape:on');
		}
		if (this._shouldRemoveOnOutsideClick()) {
			this._outsideClickHandler = _.bind(this.outsideClickHandler, this);
			$doc.on('click', this._outsideClickHandler);
			this.triggerMethod('dom:listeners:click:on');
		}
		this.triggerMethod('dom:listeners:on');
		this._documentListeners = true;
	},
	_unsetDocumentListeners(){
		if (!(this._documentListeners && !this.stack.length)) return;
		let $doc = this.getDocument();
		if (this._escapePressHandler) {
			$doc.off('keyup', this._escapePressHandler);
			delete this._escapePressHandler;
			this.triggerMethod('dom:listeners:escape:off');
		}
		if(this._outsideClickHandler) {
			$doc.off('click', this._outsideClickHandler);
			delete this._outsideClickHandler;
			this.triggerMethod('dom:listeners:click:off');
		}
		this.triggerMethod('dom:listeners:off');
		this._documentListeners = false;
	},
	_shouldRemoveOnEsc(){
		return this.getOption('removeOnEsc') === true;
	},
	_shouldRemoveOnOutsideClick(){
		return this.getOption('removeOnOutsideClick') === true;
	},


	/*
		helper methods
	*/
	getOption(...args){
		return getOption(this, ...args);
	},
	getDocument(){
		return this.$doc || $(document);
	},
	triggerMethod(){
		return triggerMethod(this, ...arguments);
	},
	isDestroyed(){
		return this._isDestroyed || this._isDestroying;
	},
	destroy(){
		if(this._isDestroyed || this._isDestroying) { return; }		
		this._isDestroying = true;

		this.triggerMethod('before:destroy');
		let $doc = this.getDocument();
		while(this.stack.length){
			this.destroyLast();
		}
		$doc.off('keyup', this._onKeyUp);
		$doc.off('click', this._outsideClick);

		this._isDestroyed = true;
		this.triggerMethod('destroy');
	},
});
export default ViewStack;
