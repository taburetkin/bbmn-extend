import { Model, Collection, BackboneView as View, Router } from '../../vendors/backbone.js';
import { MnObject } from '../../vendors/marionette.js';
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
