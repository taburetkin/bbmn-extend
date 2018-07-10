
import getModel from './get-model';
import getView from './get-view';
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
			a = func.call(a, getModel(a), getView(a)) ;
			b = func.call(b, getModel(b), getView(b));
		}
		return a < b ? -1
			: a > b ? 1
				: 0;
	}
}
