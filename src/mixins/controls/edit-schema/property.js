import validator from '../../../components/validator/index.js';
import PropertySchema from '../../../components/model-schema/property-schema.js';
import TextView from '../../../components/text-view/index.js';

import mix from '../../../utils/mix/index.js';
import buildViewByKey from '../../../utils/build-view-by-key/index.js';

import ControlView from '../control-view/index.js';
import common from './common.js';

export default Base => {
	const Mixed = mix(Base).with(ControlView, common);

	return Mixed.extend({
		
		shouldShowError: true,
		className:'edit-model-property',
		schemaClass: PropertySchema,
		debounceChildControlEvents: 0,


		getDefaultValidateRule(options){
			let schema = this.getSchema();
			let rule = _.extend({}, schema.getType(options), schema.getValidation(options));
			return rule;
		},
		getValidateRule(options = {}){
			let rule = this.getDefaultValidateRule(options);
			return rule;
		},
		
		getHeaderView(){
			let view = buildViewByKey.call(this, 'header', { TextView });
			if(view) { return view; }

			if(this.getOption('propertyLabelAsHeader')) {
				let label = this.getSchema().getLabel();
				return new TextView({ text: label, tagName: 'header'});
			}
		},
		getControlView(){
			let options = {
				value: this.getControlValue(),
				allValues: this.getParentControlValue(),				
			};
			let editOptions = this.getSchema().getEdit(options);
			return this.buildPropertyView(editOptions);
		},
		controlValidate(value, allValues){
			let rule = this.getValidateRule({ value, allValues });
			if(!rule || !_.size(rule)) return;
			return validator.validate(value, rule, { allValues });
		},
		
		// must be overrided
		// accepts:	options arguments.
		// returns:	should return Control instance
		buildPropertyView(){
			throw new Error('buildPropertyView not implemented. You should build view by your own');
		},

	});
};
