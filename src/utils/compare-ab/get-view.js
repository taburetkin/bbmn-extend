import isView from '../../bb/is-view';
export default function getModel(arg){
	return isView(arg) && arg;
}