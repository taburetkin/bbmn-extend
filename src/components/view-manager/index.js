import extend from '../../utils/extend';
import borrow from './borrow';
import collection from './collection';
import common from './common';
import customs from './customs';
import models from './models';
import render from './render';

import Events from '../../bb/events';

const MergeOptions = ['createView', 'dataFilter', 'dataComparator', 'enableCollection', '$container', 'view', 'modelView', 'modelViewOptions'];
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
	this.setCollection(this.collection || options.collection);
};

ViewManager.extend = extend;

_.extend(ViewManager.prototype, Events, borrow, collection, common, customs, models, render);

export default ViewManager;
