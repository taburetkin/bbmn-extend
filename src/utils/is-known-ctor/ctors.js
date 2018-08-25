import { Model, Collection, View, Router } from '../../vendors/backbone';
import { MnObject } from '../../vendors/marionette';
import Mn from 'backbone.marionette';

let ctors = [
	Model,
	Collection,
	View,
	Router,
	MnObject,
];

let tryGetFromMn = ['Region', 'Application', 'AppRouter'];

_.each(tryGetFromMn, ClassName => {
	_.isFunction(Mn[ClassName]) && ctors.push(Mn[ClassName]);
});


export default ctors;
