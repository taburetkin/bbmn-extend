function createDate(){
	let day = Math.floor(Math.random() * 31);
	let date = new Date();
	date.setDate(day);
	return date;
}
let iterator = 0;
let a = [], models;
a[200] = 1, models = _(a).map((v,id) => ({ id, date: createDate() }));
const BaseModel = Backbone.Model;
const Model = BaseModel.extend({
	set(){
		BaseModel.prototype.set.apply(this, arguments);
		if(this.collection)
			this.collection.trigger('update');
	}
})
const Collection = Backbone.Collection.extend({
	model: Model
});

const source = new Collection();
console.log(source);
const MnOject = Mn.Object;
const Grouper = Mn.Object.extend({
	constructor: function(opts = {}){		
		MnOject.apply(this, arguments);
		this.mergeOptions(opts, ['groupBy','source']);
		this.partitions = {};
		this.initializeEvents();
	},
	initializeEvents(){
		this.listenTo(this.source, 'update reset', this.onSourceUpdate);
	},
	onSourceUpdate(){
		let partitions = this.source.groupBy(this.groupBy);
		let keyHash = _(this.partitions).reduce((memo, value, key) => { memo[key] = []; return memo; }, {});		
		_(_.extend(keyHash, partitions)).each(_.bind(this.setPartitionModels, this));
	},
	setPartitionModels(models, key){
		let col = this.partitions[key] || new Collection();
		col.reset(models);
		this.partitions[key] = col;
	},
});

const ChildView = Mn.View.extend({
	className: 'item',
	template: _.template('<button class="backward">&lt;</button><span><%= id %>, day: <%= day%> </span><button class="forward">&gt;</button>'),
	events:{
		'click .backward'(){ this.move(-1); },
		'click .forward'(){ this.move(1); },
	},
	move(add){
		let date = new Date(this.model.get('date').valueOf());
		date.setDate(date.getDate() + add);
		this.model.set({ date });
	},

	templateContext(){
		return {
			day: this.model.get('date').getDate()
		}
	}
});

const TestView = Mn.View.extend({
	template:_.noop,
	initialize(){
		
		this.grouper = new Grouper({
			source,
			groupBy: m => { 
				iterator++;
				return m.get('date').getDate(); 
			}
		});
		source.reset(models);

		_(this.grouper.partitions).each((collection, partitionName) => {
			let selector = 'part-'+partitionName;
			this.$el.append($('<section>').addClass(selector))
			let region = this.addRegion(selector, { el: `.${selector}` });
			region.collection = collection;
		});
		this.$el.appendTo($('body'));
	},
	onRender(){
		console.log('render');
		_(this._regions).each(region => region.show(this.buildPartition(region)));
	},
	buildPartition(region){
		return new Mn.NextCollectionView({
			className: 'column',
			collection: region.collection,
			childView: ChildView
		});
	}
})

$(() => {
	let test = new TestView();
	test.render();
	console.log(iterator);
});
