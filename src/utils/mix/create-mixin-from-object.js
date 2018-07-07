export default function createMixinFromObject(arg) {
	let obj = _.clone(arg);
	return Base => { 
		if (_.isFunction(obj.constructor)) {
			let providedCtor = obj.constructor;
			obj.constructor = function(){
				Base.apply(this, arguments);
				providedCtor.apply(this, arguments);
			};
		}
		return Base.extend(obj);
	}
}
