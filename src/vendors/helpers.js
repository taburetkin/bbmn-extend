import { Model, Collection, View } from './backbone';
import { triggerMethod } from './marionette';

export function isClass(arg, Base){
	return _.isFunction(arg) && (arg == Base || arg.prototype instanceof Base);
}


export function isModel(arg){
	return arg instanceof Model;
}
export function isModelClass(arg) {
	return isClass(arg, Model);
}


export function isCollection(arg){
	return arg instanceof Collection;
}
export function isCollectionClass(arg) {
	return isClass(arg, Collection);
}


export function isView(arg){
	return arg instanceof View;
}


export function isViewClass(arg) {
	return isClass(arg, View);
}


export function triggerMethodOn(context, ...args) {
	if (_.isFunction(context.triggerMethod)) {
		return context.triggerMethod.apply(context, args);
	}

	return triggerMethod.apply(context, args);
	
}

export const extend = Model.extend;

export {
	triggerMethod
};
