import Model from '../../bb/model';
import Collection from '../../bb/collection';
import View from '../../bb/view';
import Router from '../../bb/router';
import MnObject from '../../mn/object';

import Mn from 'backbone.marionette';


let ctors = [
	Model,
	Collection,
	View,
	Router,
	MnObject,
	Mn.Application, 
	Mn.Region
];


export default ctors;
