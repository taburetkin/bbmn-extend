import { flat, unflat } from '../../utils/index.js';
function deepClone(arg = {}){
	return unflat(flat(arg || {}));
}
export default function ModelSchema({ properties } = {}){
	this.properties = deepClone(properties);
}
_.extend(ModelSchema.prototype, {
	getProperty(name){
		return this.properties[name];
	},
	getValidation(name) {
		let property = this.getProperty(name);
		return property && property.validation || {};
	},
	getType(name) {
		let property = this.getProperty(name);
		return property && property.value || {};
	}
});
