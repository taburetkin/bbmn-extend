import { isView, isViewClass } from '../../../vendors/helpers.js';
import buildViewByKey from '../../../utils/build-view-by-key/index.js';
import ControlMixin from '../control/index.js';
import cssClassModifiers from '../../view/css-class-modifiers/index.js';
import customsMixin from '../../collection-view/customs/index.js';

export default Base => {
	let Mixed = Base;

	if (!Mixed.ControlMixin) {
		Mixed = ControlMixin(Mixed);
	}

	if (!Mixed.CssClassModifiersMixin) {
		Mixed = cssClassModifiers(Mixed);
	}

	if (!Mixed.CustomsMixin) {
		Mixed = customsMixin(Mixed);
	}


	return Mixed.extend({

		renderAllCustoms: true,
		isControlWrapper: true,
		skipFirstValidationError: true,
		shouldShowError: false,
		validateOnReady: false,
		
		constructor(){
			Mixed.apply(this, arguments);
			if(!this.cssClassModifiers) {
				this.cssClassModifiers = [];
			}
			this.addCssClassModifier('control-wrapper');
			this.on({
				'control:valid': this._onControlValid,
				'control:invalid': this._onControlInvalid
			});
			if(this.getOption('validateOnReady')){
				this.once('customs:render', () => this.makeControlReady());
			}			
		},	

		getCustoms(){
			let customs = [];
			if (this.getOption('isControlWrapper')) {
				customs.push(this.getControlView());
			} else {
				customs.push(...this._customs);
			}
			customs = this.injectSystemViews(customs);
			return this._prepareCustoms(customs);
		},
		_setupCustom(view){
			this._setupChildControl(view);
			this.setupCustom(view);
		},
		_setupChildControl(view){
			if(_.isFunction(view.setParentControl)) {
				view.setParentControl(this);
			}
			this.setupChildControl(view);
		},
		setupChildControl: _.noop,
		injectSystemViews(customs = []){
			customs.unshift(this.getHeaderView());
			customs.push(
				this.getErrorView(),
				this.getFooterView()	
			);
			return customs;
		},
		bubildViewByKey(key, { skipTextCheck, options } = {}){
			let view;
			let value;

			if(!skipTextCheck) {
				value = this.getOption(key);
				if (_.isString(value)) {
					let tagName = (key == 'header' || key == 'footer') ? key : 'div';
					view = this.buildTextView(value, tagName);
					if(view) { return view; }
				}
			}

			if (value == null) {
				view = this.getOption(key+'View');
			} else {
				view = value;
			}
			
			if(isView(view)) { return view; }
			if(isViewClass(view)) {
				let _options = _.extend({}, this.getOption(key+'ViewOptions'), options);
				return new view(_options);
			}
		},
		buildTextView(text, tagName){
			let View = this.getOption('textView');
			if (!View) { return; }
			return new View({ text, tagName });
		},



		getErrorView(){
			if (!this.getOption('shouldShowError')) { return; }
			if (this.getOption('showValidateError', {force:false})) { return; }
			this._errorView = this.buildErrorView();
			return this._errorView;
		},
		buildErrorView(){
			return buildViewByKey.call(this, 'errorView', { allowTextView: false });
		},



		getHeaderView(){			
			return this.buildHeaderView({ tagName: 'header' });
		},
		buildHeaderView(options){
			return buildViewByKey.call(this, 'header', { allowTextView: true, options });
		},



		getFooterView(){
			if (this.getOption('buttonsInFooter')) {
				return this.buildButtonsView();
			} else {
				return this.buildFooterView();
			}
		},

		buildFooterView(){
			return buildViewByKey.call(this, 'footer', { allowTextView: true, options: { tagName: 'footer' }});
		},

		buildButtonsView(){
			if (this._buttonsView) {
				this.stopListening(this._buttonsView);
			}

			let options = this.buildButtonsOptions();
			let view = buildViewByKey.call(this, 'buttonsView', { allowTextView: false, options });
			if (!view) { return; }

			this._buttonsView = view;
			this.settleButtonsListeners(view);

			return view;
		},
		buildButtonsOptions(){
			let btns = this.getOption('buttons');
			if(btns) {
				return _.reduce(btns, (hash, b) => {
					let item = this.buildButton(b, this);
					hash[item.name] = item;
					return hash;
				}, {});
			}		
		},
		buildButton(value){
			if (_.isString(value)) {
				return this.buildButton({ text: value, className: value, name: value });
			} else if(_.isFunction(value)) {
				return this.buildButton(value.call(this));
			} else if(_.isObject(value)) {
				return this.fixButton(value);
			}
		},
		fixButton(button){
			return button;
		},
		settleButtonsListeners(buttonsView){
			this.listenTo(buttonsView, {
				'resolve'(){
					this.triggerMethod('resolve', this.getControlValue());
				},
				'reject'(){
					this.triggerMethod('reject');
				},
				'reject:soft'(){
					this.triggerMethod('reject:soft');
				},
				'reject:hard'(){
					this.triggerMethod('reject:hard');
				},
			});
		},

		getControlView(){
			this.control = buildViewByKey.call(this, 'controlView', { allowTextView: false, options: { parentControl: this, value: this.getControlValue() } });
			return this.control;
		},


		_onControlInvalid(value, error){
			this.disableButtons();
			this._showValidateError(error);
		},
		_onControlValid(){
			this.enableButtons();
			this._hideValidateError();
		},
		
		disableButtons(){
			if(this._buttonsView && _.isFunction(this._buttonsView.disableButton)) {
				this._buttonsView.disableButton('resolve');
			}
		},
		enableButtons(){
			if(this._buttonsView && _.isFunction(this._buttonsView.enableButton)) {
				this._buttonsView.enableButton('resolve');
			}
		},
		_showValidateError(error){
			
			let shouldShow = this.getOption('shouldShowError');
			let skipFirstValidationError = this.getOption('skipFirstValidationError');

			if (skipFirstValidationError && !this._firstValidationErrorSkipped) {
				this._firstValidationErrorSkipped = true;
				return;
			}

			if (!shouldShow) return;

			let show = this.getOption('showValidateError', { force: false });
			if (_.isFunction(show)) {
				show.call(this, error);
			} else {
				if (!this._errorView) return;
				this._errorView.showError(error);
			}		
		},
		_hideValidateError(){
			let hide = this.getOption('hideValidateError', { force: false });
			if (_.isFunction(hide)) {
				hide.call(this);
			} else {
				if (!this._errorView) return;
				this._errorView.hideError();
			}		
		},
	}, { ControlViewMixin: true });


};
