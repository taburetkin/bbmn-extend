import getInputType from './get-input-type';

import getOption from '../../../utils/get-option';

export default function setInputAttributes(inputView, opts = {}) {

	let attributes = getOption(inputView, 'attributes', { checkAlso: opts, args:[inputView] });

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
		let value = getOption(inputView, key, { checkAlso: opts, args:[inputView] });
		if (value != null)
			restrictions[key2] = value;
	});

	inputView.attributes = _.extend({
		value: inputView.value,
		type: getInputType(inputView, opts),
	}, restrictions, attributes);

}
