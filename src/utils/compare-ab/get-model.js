import { isModel, isView } from '../../vendors/helpers.js';
export default function getModel(arg){

	if (isModel(arg)) { return arg; }
	
	if (isView(arg)) { return arg.model; }

}
