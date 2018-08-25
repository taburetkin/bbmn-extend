import { isView }  from '../../vendors/helpers';
export default function getModel(arg){
	return isView(arg) && arg;
}
