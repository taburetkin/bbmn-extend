import { isView, isViewClass, buildViewByKey } from '../../../utils/index.js';
import ControlMixin from '../control/index.js';
import { cssClassModifiers } from '../../view/index.js';


export default Base => {
	let Mixed = Base;
	if (!Mixed.ControlMixin) {
		Mixed = ControlMixin(Mixed);
	}
	if (!Mixed.CssClassModifiersMixin) {
		Mixed = cssClassModifiers(Mixed);
	}

	return Mixed.extend({
		renderAllCustoms: true,
		isControlWrapper: true,
		skipFirstValidationError: true,
		shouldShowError: false,

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
			this.errorView = this.buildErrorView();
			return this.errorView;
		},
		buildErrorView(){
			return buildViewByKey.call(this, 'errorView', { allowTextView: false });
		},



		getHeaderView(){			
			return this.buildHeaderView();
		},
		buildHeaderView(){
			return buildViewByKey.call(this, 'header', { allowTextView: true, options: { tagName: 'header' }});
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
				if (!this.errorView) return;
				this.errorView.showError(error);
			}		
		},
		_hideValidateError(){
			let hide = this.getOption('hideValidateError', { force: false });
			if (_.isFunction(hide)) {
				hide.call(this);
			} else {
				if (!this.errorView) return;
				this.errorView.hideError();
			}		
		},
	}, { ControlViewMixin: true });


};
