

import normalizeArguments from './normalize-arguments.js';

export default function withMethod(...args) {

	let mixins = normalizeArguments(args, this.options);
	let Mixed = this.class;
	if (!mixins.length) return Mixed;
	else
		return _.reduce(mixins, (Memo, Ctor) => { 
			let mixed = Ctor(Memo);
			return mixed;
		}, Mixed);

}
