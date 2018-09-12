import { Model, Collection, BackboneView as View } from './backbone.js';


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

export const extend = Model.extend;

