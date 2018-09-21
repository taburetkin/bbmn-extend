import { isView }  from '../../vendors/helpers.js';
export default function getModel(arg){
	return isView(arg) && arg;
}
