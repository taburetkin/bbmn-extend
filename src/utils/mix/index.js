import defaultOptions from './options';
import withMethod from './with';

import extend from '../extend';



export default function mix(_ctor, options) {

	let opts = _.extend({}, defaultOptions, options);

	let ctor;
	let name = 'mixed';

	if (_.isFunction(_ctor)) {
		ctor = _ctor;
		if(_ctor.name)
			name += ':' + _ctor.name;
	}
	else if (_.isObject(_ctor)) {

		ctor = _.isFunction(_ctor.constructor) ? _ctor.constructor : function mx() { };
		_.extend(ctor.prototype, _.omit(_ctor,'constructor'));

	} else {
		throw new Error('Mix argument should be a class or a plain object');
	}

	if (!_.isFunction(ctor.extend))
		ctor.extend = extend;

	return {
		name,
		options: opts,
		with: withMethod,
		class: ctor,
	};
}
