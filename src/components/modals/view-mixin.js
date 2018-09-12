import { isView, isViewClass, mix } from '../../utils/index.js';


import { customs, nextCollectionView } from '../../mixins/collection-view/index.js';
import { destroy } from '../../mixins/view/index.js';
import TextView from '../text-view/index.js';

export default CollectionView => {
	let Mixed = CollectionView;
	let mixWith = [];

	if (!Mixed.DestroyMixin) {
		mixWith.push(destroy);
	}
	if (!Mixed.CollectionViewMixin_4x) {
		mixWith.push(nextCollectionView);
	}

	if (!Mixed.CustomsMixin) {
		mixWith.push(customs);
	}

	if (mixWith.length) {
		Mixed = mix(Mixed).with(...mixWith);
	}

	return Mixed.extend({
		viewComparator:false,
		wrapContent: true,
		childViewContainer: '[data-modal-content]',
		renderAllCustoms: true,
		templateContext(){
			return {
				shouldWrapContent: this.getOption('wrapContent') === true,
			};
		},
		events:{
			'click'(event){
				if(this.getOption('preventRemove')) {
					return;
				}
				let $el = $(event.target);
				event.stopPropagation();
				if ($el.closest('[data-modal-content]').length) {
					return;
				}
				this.destroy();
			}
		},
		customs:[
			(v) => v.createCloseButton(),
			(v) => v.takeOptionsView('header'),
			(v) => v.takeOptionsView('content'),
			(v) => v.takeOptionsView('footer'),
		],
		createCloseButton(){
			if (!this.getOption('closeButton') || this.getOption('preventRemove')) {
				return;
			}
			let Button = this.getOption('closeButtonView');
			if (!isViewClass(Button)) {
				throw new Error('CloseButtonView not defined in modals config');
			}
			let view = new Button({ attributes: { 'data-modal-close':'' } });
			this.listenTo(view, 'click', this.destroy);
			return view;
		},
		takeOptionsView(key){
			let view = this.getOption(key);
			let _view;
			if(!view) {			
				return view;
			} else if(isView(view)) {
				_view = view;
			}
			else if(_.isString(view)){			
				let tagName = ['header','footer'].indexOf(key) > -1 ? key : 'div';
				let View = this.getOption('textView') || TextView;
				_view = new View({ text: view, tagName });
			} else if(isViewClass(view)) {
				let options = this.getOption(key+'Options');
				_view = new view(options);
			}
			if(_view){
				!this.modalChildren && (this.modalChildren = {});
				this.modalChildren[key] = _view;
				if (key === 'content') {
					this._initContentListeners(_view);
				}
				return _view;
			}
		},
		_initContentListeners(content){
			this.listenTo(content, {
				'destroy': () => this.destroy(),
				'done': () => this.destroy(),
			});
		},
		attributes:{
			'data-modal': ''
		},
	});
};
