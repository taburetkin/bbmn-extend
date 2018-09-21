import extend from '../../utils/extend/index.js';
import borrow from './borrow.js';
import collection from './collection.js';
import common from './common.js';
import customs from './customs.js';
import models from './models.js';
import render from './render.js';
import emptyView from './empty-view.js';

import { Events } from '../../vendors/backbone.js';

const MergeOptions = [
	'createView',
	'dataFilter',
	'dataComparator',
	'enableCollection',
	'$container',
	'view',
	'modelView',
	'modelViewOptions',
	'emptyView',
	'emptyViewOptions',
	'enableFilterForCustomViews'
];

const ViewManager = function(options = {}){
	this.options = _.omit(options, 'collection');
	this.mergeOptions(options, MergeOptions);
	this._ensureOptions();
	this._store = {

		//holds current filtered set of model contexts
		filtered:[],

		//holds all model contexts
		items: [],

		//grants fast access to a context through model id or cid
		byModel: {},

		//holds all cutoms contexts
		customs: [],
	
		//indicates if comparator should be applied
		isSorted: false,

		//indicates if filter should be applied
		isFiltered: false,

	};
	
	//in collection mixin
	if(this.enableCollection)
		this.setCollection(this.collection || options.collection);
};

ViewManager.extend = extend;

_.extend(ViewManager.prototype, Events, borrow, collection, common, customs, models, render, emptyView);

export default ViewManager;
