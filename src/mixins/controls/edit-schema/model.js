import ControlView from '../control-view/index.js';
import common from './common.js';
import mix from '../../../utils/mix/index.js';
import EditProperty from './property.js';

import ModelSchema from '../../../components/model-schema/model-schema.js';

export default Base => {
	const Mixed = mix(Base).with(ControlView, common);

	return Mixed.extend({
		
		validateOnReady: true,
		buttonsInFooter: true,
		isControlWrapper: false,
		schemaClass: ModelSchema,
		editPropertyClass: EditProperty,

		propertyLabelAsHeader: true,

		className:'edit-model-control',

		getCustoms(){
			let customs = [];
			customs.push(...this.getPropertiesViews());
			customs.push(...this._customs);
			customs = this.injectSystemViews(customs);
			return this._prepareCustoms(customs);
		},
		getPropertiesViews(){
			let modelSchema = this.getSchema();
			let propertiesToShow = this.getOption('propertiesToShow', { args: [ this.model, this ]}) || [];
			if(!propertiesToShow.length) {
				propertiesToShow = modelSchema.getPropertiesNames();
			}
			return _.map(propertiesToShow, name => this._createEditProperty(name, modelSchema));
		},
		_createEditProperty(name, modelSchema){
			let schema = modelSchema.getProperty(name, { create: true });
			let EditProperty = this.getEditPropertyClass();
			const def = {
				controlName: name,
				schema,
				value: this.getPropertyValue(name),
				allValues: this.getControlValue({ notValidated: true }),
				propertyLabelAsHeader: this.getOption('propertyLabelAsHeader')
			};
			let options = this.getEditPropertyOptions(def);
			return this.createEditProperty(EditProperty, options);
		},
		getPropertyValue(property){
			return this.getControlValue(property);
		},
		getEditPropertyClass(){
			return this.getOption('editPropertyClass');
		},
		getEditPropertyOptions(defaultOptions){
			return _.extend({}, defaultOptions, this.getOption('editPropertyOptions'));
		},
		createEditProperty(EditProperty, options){
			return new EditProperty(options);
		},

	});
};
