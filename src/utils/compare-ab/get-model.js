import isModel from '../../bb/is-model';
import isView from '../../bb/is-view';
export default function getModel(arg){
	return isModel(arg) ? arg
		: isView(arg) ? arg.model
			: undefined;
}