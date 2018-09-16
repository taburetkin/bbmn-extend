import ModelSchema from './model-schema.js';

const store = {
	schemas: {},
	getStoreName(arg){
		if(_.isString(arg) && arg !== '') {
			return arg;
		}

		if (_.isFunction(arg)) {
			let store = this.getStoreByCtor(arg);
			if (store) {
				return store.name;
			}
		}
		return _.uniqueId('modelSchema');		
	},
	getStoreByCtor(ctor){
		return _.find(this.schemas, f => f.ctor === ctor);		
	},
	isNotInitialized(arg){
		return !this.getStore(arg);
	},
	initialize({ name, schema = {} } = {}) {
		let ctor = _.isFunction(name) && name || undefined;
		name = this.getStoreName(name);

		if(name in this.schemas) { return; }

		if(!(schema instanceof ModelSchema) && _.isObject(schema)){
			schema = new ModelSchema(schema);
		} else {
			schema = new ModelSchema({});
		}
		this.schemas[name] = {
			name, ctor, schema
		};
	},
	getStore(arg){
		if (_.isString(arg)) {
			return this.names[name];
		} else if (_.isFunction(arg)) {
			return this.getStoreByCtor(arg);
		}
	},
	get(arg) {
		let cache = this.getStore(arg);
		return cache && cache.schema || undefined;
	}
};


export default store;
