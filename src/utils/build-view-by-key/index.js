import { isView, isViewClass, getOption } from '../../utils/index.js';
import { TextView } from '../../components/index.js';

function get(context, key){
	if(_.isFunction(context.getOption)){
		return context.getOption(key);
	}
	else {
		return getOption(context.options, key, { context, args: [ context ], checkAlso: context });
	}
}

export default function buildViewByKey(key, { allowTextView = true, options } = {}) {
	
	if(!_.isString(key)) { return; }

	let view = get(this, key);
	let _options = get(this, key + 'Options');

	if (allowTextView && _.isString(view)) {
		_options = _.extend({}, _options, { text: view });
		view = TextView;
	}
	options = _.extend({}, options, _options);

	if (isView(view)) {
		return view;
	} else if (isViewClass(view)) {
		return new view(options);
	}	
}
