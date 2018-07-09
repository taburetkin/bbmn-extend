import ControlMixin from '../control';
import setInputAttributes from './set-attributes';
import setInputEvents from './set-events';
import getOption from '../../../utils/get-option';

export default Base => {

	let Mixin = Base.ControlMixin ? Base : ControlMixin(Base);

	return Mixin.extend({
		constructor(opts){
			setInputAttributes(this, opts);
			setInputEvents(this, opts);
			Mixin.apply(this, arguments);
			if (!_.isFunction(this.getOption)) {
				this.getOption = _.partial(getOption, this, _, { args: [this.model, this]});
			}
			let value = this.getOption('value');
			
			this.el.value = value;
			this.setControlValue(value);
		},
		tagName:'input',
		template: false,
		setControlValue(value)
		{
			let newvalue = value;
			let len = this.getMaxLength();
			if (len > 0) {
				newvalue = (value || '').substring(0, len);
			}
			this.value = newvalue;
			return newvalue;
		},
		getValueType(){
			return this.valueType;
		},

		
		getMaxLength()
		{
			let len = parseInt(this.getOption('maxLength'),10);
			return !isNaN(len) && len;
		},
		isLengthValid(){
			let value = this.getControlValue();
			let len = this.getMaxLength();
			return len == null || value.length < len;
		},
		isCharValid(char) {
			let type = this.getValueType();

			if (type == 'number') {
				return char == '.' || !isNaN(parseInt(char, 10));
			} else {
				return true;
			}
		}
	});
};
