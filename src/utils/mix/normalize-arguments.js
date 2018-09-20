
import createMixinFromObject from './create-mixin-from-object.js';

export default function normalizeArguments(args, opts = {}) {
	let raw = {};
	let wrap = opts.wrapObjectWithConstructor == true;
	let merge = opts.mergeObjects == true;
	let mixins = [];
	_(args).each(arg => {
		
		//if argument is function just put it to mixins array
		//and continue;
		if (_.isFunction(arg)) {
			mixins.push(arg);
			return;
		}

		//if argument is not an object just skip it
		if (!_.isObject(arg)) return;

		//if mergeObjects == false or wrapObjectWithConstructor == true 
		//and there is a constructor function
		//converting to a mixin function
		//otherwise extend rawObject
		if (!merge || (wrap && _.isFunction(arg.constructor))) {
			mixins.push(createMixinFromObject(arg));
		} 
		else {
			_.extend(raw, arg);
		}
	
	});

	//if rawObject is not empty
	//convert it to a mixin function
	//and put it to the begin of mixins array
	if (_.size(raw))
		mixins.unshift(createMixinFromObject(raw));

	return mixins;
}
