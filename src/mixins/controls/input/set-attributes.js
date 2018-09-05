import getInputType from './get-input-type';

import getOption from '../../../utils/get-option';


export default function setInputAttributes(inputView, opts = {}) {

	let attributes = getOption(inputView, opts, 'attributes');

	let check = _.extend({}, inputView, opts, inputView.valueOptions, opts.valueOptions);

	let restrictionKeys = {
		'maxLength':'maxlength', 
		'minLength':'minlength',
		'minValue':'min', 
		'maxValue':'max', 
		'valuePattern':'pattern',
		'required':'required',
		'value':'value'
	};
	let restrictions = {};
	_(restrictionKeys).each((key2, key) => {
		let value = check[key];
		//getOption(inputView, opts, key);
		if (value != null)
			restrictions[key2] = value;
	});

	inputView.attributes = _.extend({
		value: inputView.value,
		type: getInputType(inputView, opts),
	}, restrictions, attributes);
	
	if(opts.attributes)
		delete opts.attributes;
}
