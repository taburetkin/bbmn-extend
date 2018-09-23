import { isView, isViewClass, getOption } from '../../utils/index.js';
import { TextView } from '../../components/index.js';

export default function buildViewByKey(key, { allowTextView = true, options } = {}) {
	
	if(!_.isString(key)) { return; }

	let view = getOption(this, key, { args: [ this ] });
	let _options = getOption(this, key + 'Options', { args: [ this ] });

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
