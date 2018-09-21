
import getModel from './get-model.js';
import getView from './get-view.js';
export default function compareAB(a, b, func){
	if(_.isArray(func)) {

		let result = 0;

		_(func).every((f) => {
			result = compareAB(a,b,f);
			return result === 0;
		});
		
		return result;
	} else {
		if (_.isFunction(func)) {
			a = func.call(a, getModel(a), getView(a));
			b = func.call(b, getModel(b), getView(b));
		}

		if (a < b) return -1;
		if (a > b) return 1;
		return 0;

	}
}
