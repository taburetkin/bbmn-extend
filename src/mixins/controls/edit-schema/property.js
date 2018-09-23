import validator from '../../../components/validator/index.js';
import ControlView from '../control-view/index.js';
import common from './common.js';
import mix from '../../../utils/mix/index.js';
import PropertySchema from '../../../components/model-schema/property-schema.js';
import buildViewByKey from '../../../utils/build-view-by-key/index.js';
import TextView from '../../../components/text-view/index.js';

export default Base => {
	const Mixed = mix(Base).with(ControlView, common);

	return Mixed.extend({
		
		shouldShowError: true,
		className:'edit-model-property',
		schemaClass: PropertySchema,
		debounceChildControlEvents: 0,

		getValidateRule(){
			if (!this._validateRule) {
				let schema = this.getSchema();
				this._validateRule = _.extend({}, schema.getType(), schema.getValidation());
			}
			return this._validateRule;
		},
		
		getHeaderView(){
			let view = buildViewByKey.call(this, 'header', { allowTextView: true });
			if(view) { return view; }

			if(this.getOption('propertyLabelAsHeader')) {
				let label = this.getSchema().getLabel();
				return new TextView({ text: label, tagName: 'header'});
			}
		},
		getControlView(){
			// let View = this.getControlViewClass(this.getSchema());
			// if (!View) return;
			// let options = this.getControlViewOptions();
			// return new View(options);
		},
		controlValidate(value, allValues){
			let rule = this.getValidateRule();
			if(!rule || !_.size(rule)) return;
			return validator.validate(value, rule, { allValues });
		},

		// getControlViewClass(){
		// 	return Input;
		// },
		// getControlViewOptions(){
		// 	let schema = this.getSchema();
		// 	return { 
		// 		value: this.getControlValue(),
		// 		valueOptions: schema.getType(),
		// 		inputAttributes:{
		// 			name: schema.name,
		// 		},
		// 	};
		// },
	});
};
