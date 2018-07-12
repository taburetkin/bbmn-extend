import View from './view';
import isView from './is-view';
export default function isViewClass(arg) {
	return _.isFunction(arg) && (arg == View || isView(arg.prototype));
}
