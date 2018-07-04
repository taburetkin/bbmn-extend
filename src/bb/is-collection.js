import Collection from './collection';
export default function isModel(arg){
	return arg instanceof Collection;
}