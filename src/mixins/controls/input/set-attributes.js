import getInputType from './get-input-type';
import notInitializedOption from './_get-option';
export default function setInputAttributes(inputView, opts = {}) {

	let attributes = notInitializedOption.call(inputView, 'attributes', opts);

	let restrictionKeys = {
		'maxLength':'maxlength', 
		'minValue':'min', 
		'maxValue':'max', 
		'valuePattern':'pattern',
		'required':'required',
		'value':'value'
	};
	let restrictions = {};
	_(restrictionKeys).each((key2, key) => {
		let value = notInitializedOption.call(inputView, key, opts);
		if (value != null)
			restrictions[key2] = value;
	});

	inputView.attributes = _.extend({
		value: inputView.value,
		type: getInputType(inputView, opts),
	}, restrictions, attributes);

}
