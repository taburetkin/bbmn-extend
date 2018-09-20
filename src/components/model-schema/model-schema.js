import PropertySchema from './property-schema.js';

export default function ModelSchema(properties = {}){
	this.properties = _.reduce(properties, (memo, property, name) => {
		memo[name] = this._createProperty(name, property);
		return memo;
	}, {});
}
_.extend(ModelSchema.prototype, {
	_createProperty(name, property = {}){
		let props = this.getProperties();
		let order = _.size(props);
		return new PropertySchema({ name, property, modelSchema: this, order });
	},
	getProperties(){
		return this.properties;
	},
	getPropertiesArray(){
		let props = this.getProperties();
		return _.toArray(props)
			.sort((p1,p2) => p1.order - p2.order);		
	},
	getPropertyNames(){
		let props = this.getPropertiesArray();
		return _.pluck(props, 'name');
	},
	getProperty(name, { create = false } = {}){
		let property = this.properties[name];
		if(property || !create) {
			return property;
		}
		property = this.properties[name] = this._createProperty(name);
		return property;
	},
	getValidation(name) {
		let property = this.getProperty(name);
		return property && property.getValidation() || {};
	},
	getType(name) {
		let property = this.getProperty(name);
		return property && property.getType() || {};
	},
	getLabel(name){
		let property = this.getProperty(name);
		return property && property.getLabel() || '';
	}
});
