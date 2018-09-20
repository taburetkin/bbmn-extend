import defaultOptions from './options.js';
import withMethod from './with.js';

import extend from '../extend/index.js';



export default function mix(_ctor, options) {

	let opts = _.extend({}, defaultOptions, options);

	let ctor;

	if (_.isFunction(_ctor)) {
		ctor = _ctor;
	}
	else if (_.isObject(_ctor)) {
		let b = _.isFunction(_ctor.constructor) && _ctor.constructor;
		ctor = function mx() { b.apply(this, arguments); };
		_.extend(ctor.prototype, _.omit(_ctor,'constructor'));

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
