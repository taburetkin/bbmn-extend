import defaultOptions from './options';
import withMethod from './with';

import extend from '../extend';



export default function mix(_ctor, options) {

	let opts = _.extend({}, defaultOptions, options);

	let ctor;
	if (_.isFunction(_ctor)) {
		ctor = _ctor;
	}
	else if (_.isObject(_ctor)) {
		ctor = function () { };
		_.extend(ctor.prototype, _ctor);
	} else {
		throw new Error('Mix argument should be a class or a plain object');
	}

	if (!_.isFunction(ctor.extend))
		ctor.extend = extend;

	return {
		options: opts,
		with: withMethod,
		class: ctor,
	};
}
