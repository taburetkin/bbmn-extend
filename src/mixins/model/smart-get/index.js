import Model from '../../../bb/model';
import getNestedResult from './get-nested-result';
import getPropertySchema from './get-property-schema';
import getDisplayConfig from './get-display-config';
import getByPath from '../../../utils/get-by-path';
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
			if(key == null) return;	
			
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

				let display = getDisplayConfig(key, context, prop);

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
	});

	return Mixed;
}