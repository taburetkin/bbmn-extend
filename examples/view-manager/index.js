console.log('bbmn', bbmn);
$(() => {


	let a=[]; a[8] = 1;
	let models = _(a).map((aa,id) => ({ id }));
	let collection = new Backbone.Collection(models);
	
	let modelView = Mn.View.extend({
		template:_.template('<div><%= id %> : <%= cid %> </div>'),
		events:{
			'click'(){
				this.destroy();
			}
		},
		templateContext(){
			return {
				cid: this.cid
			}
		}
	});
	
	const Custom = Mn.View.extend({
		className:'item custom',
		template:_.template('<%= cid %>: <%= text %>'),
		templateContext(){
			return {
				cid: this.cid,
				text: this.getOption('text') || '',
			}
		}
	});

	let secondComparator = (v1, v2) => v1.model && v2.model && v2.model.id - v1.model.id;
	let firstComparator = (v1, v2) => v1.model && v2.model && v1.model.id - v2.model.id;
	
	let secondFilter = v => !v.model || (v.model.id % 20) == 0;
	let firstFilter = null;

	const Experimental = Mn.View.extend({
		template:_.noop,
		enableCustomViews: false,
		enableCollectionViews: false,

		constructor: function(){
			Mn.View.apply(this, arguments);
			this._initializeViewManager();
		},
		_initializeViewManager(){
			let customs = this.getOption('enableCustomViews');
			let models = this.getOption('enableCollectionViews');
			if(!(customs || models)) return;

			this._viewManager = new bbmn.components.ViewManager({
				enableCollection: models,
				collection: models && this.collection || null,
				view: this,
				modelView: this.getOption('modelView', { force: false }),
				modelViewOptions: this.getOption('modelViewOptions', { force: false }),
			});

		},

		render() {
			const template = this.getTemplate();
		
			if (template === false || this._isDestroyed) { return this; }
		
			this._viewManager && this._viewManager.beforeRender();

			this.triggerMethod('before:render', this);
		

			// If this is not the first render call, then we need to
			// re-initialize the `el` for each region
			if (this._isRendered) {
				this._reInitRegions();
			}
		
			this._renderTemplate(template);
			this.bindUIElements();
		
			this._viewManager && this._viewManager.processAndRender();

			this._isRendered = true;
			this.triggerMethod('render', this);
		
			return this;
		},

		setComparator(comparator, opts) {
			this._viewManager && this._viewManager.setComparator(comparator, opts);
			this.viewComparator = comparator;
			return this;
		},
		setFilter(filter, opts) {
			this._viewManager && this._viewManager.setFilter(filter, opts);
			this.viewFilter = filter;
			return this;
		},
		addChildView(){
			this._viewManager && this._viewManager.addCustomView.apply(this._viewManager, arguments);
		},

		onBeforeRender(){
			if(this._isRendered) return;
			this.addChildView(() => new Custom({ text:'at the Top'}), 0);
			this.addChildView(new Custom({ text:'at the Bottom'}), Infinity);
			this.addChildView(new Custom({ text:'at 3rd'}), 3);
			this.addChildView(() => new Custom({ text:'no index'}));
		}	

	});


	let testTemplate = `
	<button a="1">toggle comparator</button>
	<button a="2">toggle filter</button>
	<button a="3">add 100</button>
	<button a="4">remove 100</button>
	<button a="5">reset</button>
	<button a="6">render</button>
	<br/>
	<div></div><section></section>
	`;
	let Test = Mn.View.extend({
		el:'body',
		template: _.template(testTemplate),
		regions:{
			'original':'div',
			'experimental':'section'
		},
		ncvs:{
			//'original':Original,
			'experimental':Experimental
		},
		onRender(){
			//this.showNcv('original');
			this.showNcv('experimental');
		},
		showNcv(name){
			console.group(name);
			console.time(name + ' total');
			console.time(name + ' initialize');
			let View = this.ncvs[name];
			let view = this[name] = new View({
				enableCollectionViews: true,
				collection,
				modelView,				
			});
			console.timeEnd(name + ' initialize');
			//view.on('all', c => console.log('	> e :', c));
	
			console.time(name + ' show');
			this.showChildView(name, view);
			console.timeEnd(name + ' show');
			console.timeEnd(name + ' total');
			console.groupEnd(name);
		},
		events:{
			'click [a=1]'(){
				let toggle = name => {
					let view = this[name];
					if(!view) return;
					let current = view.viewComparator;
					if(!current || current == firstComparator)
						view.setComparator(secondComparator);
					else {
						view.setComparator(firstComparator);
					}
					// let comparator = current == viewComparator ? view._alternateComparator : viewComparator;
					// view._alternateComparator = current;
					// view.setComparator(comparator);
				}
				toggle('original');
				toggle('experimental');
			},
			'click [a=2]'(){
				let toggle = name => {
					let view = this[name];
					if(!view) return;
					let current = view.viewFilter;
					if(!current || current == firstFilter){
						view.setFilter(secondFilter);	
					} else {
						view.setFilter(firstFilter);	
					}
					// let alternate = view._alternateFilter;
					// view.setFilter(alternate);
					// view._alternateFilter = current;
					//console.log('new filter:', alternate);
				}
				toggle('original');
				toggle('experimental');
			},
			'click [a=3]'(){
				let a=[]; a[99]=1;
				let models = _(a).map(() => ({ id: parseInt(_.uniqueId(),10) }));
				collection.add(models);
			},
			'click [a=4]'(){
				let models = collection.models.slice(collection.length - 100, collection.length);
				collection.remove(models);
			},
			'click [a=5]'(){
				collection.reset();
			},
			'click [a=6]'(){
				this.original && this.original.render();
				this.experimental && this.experimental.render();
			},
		},
	});
	let test = new Test();
	test.render();

	console.log(test);
});
