import { isViewClass } from '../../utils/index.js';
import renderInNode from '../../components/render-in-node/index.js';
import { View as MnView } from '../../vendors/marionette.js';
import { ViewStack } from '../../components/index.js';

import ViewMixin from './view-mixin';

export default {
	
	template: _.template(`
<div data-modal-bg></div>
<% if(shouldWrapContent) {%><div data-modal-content-wrapper><%} %>
<section data-modal-content></section>
<% if(shouldWrapContent) {%></div><%} %>
`),

	BaseView: undefined,
	TextView: undefined,
	ModalView: undefined,
	CloseButtonView: undefined,

	buildView(options, View){
		if(!isViewClass(View)) {
			if (!this.ModalView) {
				if (!this.BaseView) {
					throw new Error('modals config has no View defined. please set View or BaseView');
				}
				this.ModalView = ViewMixin(this.BaseView);
			}
			View = this.ModalView;
		}
		options = _.extend({ 
			textView: this.TextView || MnView, 
			closeButtonView: this.CloseButtonView || MnView,
			template: this.template,
		}, options);
		return new View(options);
	},
	render(view, stack, options = {}){
		let el = _.result(this, 'container');
		if(el && el.jquery){
			el = el.get(0);
		}
		options = _.extend({ 
			el, replaceElement: true, destroyOnEmpty: true,			
		}, options);

		renderInNode(view, options);

		if (stack) {
			let { preventRemove } = options;
			stack.add(view, { preventRemove });
		}
	},
	container: () => document.querySelector('body'),
	stackOptions: {
		removeOnEsc: true,
		removeOnOutsideClick: true,
	},
	getStack(options){
		if (!this.stack) {
			let stackOptions = this.stackOptions || options;
			this.stack = new ViewStack(stackOptions);
		}
		return this.stack;
	}
};

