import ControlMixin from '../control';
import setInputAttributes from './set-attributes';
import setInputEvents from './set-events';
import getOption from '../../../utils/get-option';
import getInputType from './get-input-type';
export default Base => {

	let Mixin = Base.ControlMixin ? Base : ControlMixin(Base);

	return Mixin.extend({
		constructor(){
			Mixin.apply(this, arguments);

			let value = getOption(this, 'value', { args: [this.model, this] });
			this.setControlValue(value);

			setInputAttributes(this);
			setInputEvents(this);
		},
		tagName:'input',
		getInputType()
		{
			return getInputType(this);
		}
	});
};
