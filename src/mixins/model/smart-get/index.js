import { Model } from '../../../vendors/backbone.js';
import getNestedResult from './get-nested-result.js';
import getPropertySchema from './get-property-schema.js';
import getDisplayConfig from './get-display-config.js';
import getByPath from '../../../utils/get-by-path/index.js';


export default Base => {
	const originalGet = Model.prototype.get;
	const Mixed = Base.extend({
		getByPath(key){
			if(key.indexOf('.') > -1)
				return getByPath(this, key);
			else
				return originalGet.call(this, key);
		},
		get(key, opts = {}){
			if(key == null || key == '') return;	
			
			let value = 'value' in opts 
				? opts.value
				: this.getByPath.call(this, key);

			if (!_.size(opts)) {
				return value;
			}

			let prop = getPropertySchema(this, key);
			let result = opts.nested && getNestedResult(value, this, prop);
			if (result != null) {
				return result;
			}

			if(_.isFunction(opts.transform) && !opts.raw) {
				value = opts.transform.call(this, value, opts, this);
			}

			if(_.isFunction(prop.transform) && !opts.raw){
				value = prop.transform.call(this, value, opts, this);
			}

			if(opts.display === true){

				let display = getDisplayConfig(key, this, prop);

				if(opts.alternative){
					value = _.isFunction(display.alternative) && display.alternative.call(this, value, _.extend({},opts,prop), this);
				}
				else if(_.isFunction(display.transform)) {
					value = display.transform.call(this, value, opts, this);
				}
				if(display.ifEmpty && (value == null || value === ''))
					return display.ifEmpty;
			}

			return value;
		},
		display(key, opts = {}){
			_.extend(opts, { display:true });
			return this.get(key, opts);
		},
		propertyName(key) {
			let prop = getPropertySchema(this, key);
			let display = getDisplayConfig(key, this, prop);
			return display.label || key;
		}
	});

	return Mixed;
};
