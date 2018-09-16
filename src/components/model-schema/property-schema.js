import { betterResult } from '../../utils/index.js';

export function PropertySchema({ name, property, modelSchema }){
	this.name = name;
	this.schema = _.extend({}, property);	
	this.modelSchema = modelSchema;
}
_.extend(PropertySchema.prototype, {
	getValidation() {
		return this.schema.validation || {};
	},
	getType() {
		return this.schema.value || {};
	},
	getDisplay(){
		return this.schema.display || {};
	},
	getLabel(value, hash){
		let label = this.getDisplay().label;
		return betterResult({ label },'label', { args: [value, hash] });
	}
});
