import { isModel, isView } from '../../vendors/helpers';
export default function getModel(arg){

	if (isModel(arg)) { return arg; }
	
	if (isView(arg)) { return arg.model; }

}
