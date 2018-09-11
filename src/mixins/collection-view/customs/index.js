import { isView, isViewClass, betterResult } from '../../../utils/index.js';

export default Base => Base.extend({
	
	renderAllCustoms: false,
	shouldMergeCustoms: false,

	constructor(){
		this._customs = [];
		Base.apply(this, arguments);
		this._initializeCustoms();
	},
	_initializeCustoms(){

		let optionsCustoms = betterResult(this.options, 'customs', { args: [this], context: this });
		let instanceCustoms = betterResult(this, 'customs', { args: [this] });
		let shouldMergeCustoms = this.getOption('shouldMergeCustoms');
		let add;
		if (shouldMergeCustoms) {
			add = (instanceCustoms || []).concat(optionsCustoms || []);			
		} else {
			add = instanceCustoms || optionsCustoms || [];
		}
		this._customs.push(...add);

		if (this.getOption('renderAllCustoms')) {
			this.on('render', this._renderCustoms);
		}
	},
	_renderCustoms(){
		if (!this.getOption('renderAllCustoms')) return;
		let customs = this.getCustoms();
		this.triggerMethod('before:customs:render');
		this.addChildViews(customs);
		this.triggerMethod('customs:render');
	},
	getCustoms() {
		if(!this._customs.length) return;
		return this._prepareCustoms(this._customs.slice(0));
	},
	_prepareCustoms(rawcustoms){
		return _.reduce(rawcustoms, (array, item) => {
			let args = this._prepareCustom(item);
			args && (args = this.buildCustom(...args));
			args && array.push(args);
			return array;
		},[]);
	},
	_prepareCustom(arg){
		if (_.isFunction(arg)) {
			return this._prepareCustom(arg.call(this, this));
		} else if (_.isArray(arg)) {
			return arg;
		} else {
			return [arg, { index: 0 }];
		}
	},
	buildCustom(view, options = {}){ 
		if (isViewClass(view)) {
			let childOptions = this.getOption('customViewOptions');
			view = new view(childOptions);
		} else if (_.isFunction(view)) {
			view = view.call(this, this);
		}
		if (isView(view)) {
			return [view, options]; 
		}
	},
	addChildViews(children = []){
		if (!children.length) { return; }
		let items = _.filter(children, f => !!f);
		let notComplete = false;
		while(items.length){
			let args = items.pop();
			if (!_.isArray(args)) {
				args = [args, { index: 0 }];
			}
			let [ view, options = {} ] = args;
			options.preventRender = !!items.length;
			if (!isView(view)) { continue; }

			this.addChildView(view, options);
			notComplete = options.preventRender;
		}
		if (notComplete) {
			this.sort();
		}
	},
}, { CustomsMixin: true });