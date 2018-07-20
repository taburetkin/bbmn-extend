export default function createMixinFromObject(arg) {
	let mixedObj = _.clone(arg);
	let mixedCtor = _.isFunction(mixedObj.constructor) && mixedObj.constructor;
	return Base => { 
		if (_.isFunction(mixedCtor)) {
			//let providedCtor = ((mixed) => mixed)(obj.constructor);
			mixedObj.constructor = function mx(){
				Base.apply(this, arguments);
				mixedCtor.apply(this, arguments);
			};
		}
		return Base.extend(mixedObj);
	};
}
