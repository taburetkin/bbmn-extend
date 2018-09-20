import { betterResult } from '../../utils/index.js';

export default function PropertySchema({ name, property, modelSchema, order = 0 }){
	this.name = name;
	this.schema = _.extend({}, property);	
	this.modelSchema = modelSchema;
	if (this.schema.order != null)
		order = this.schema.order;
	this.order = order;
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
	},
	getEditView(){},
});
