import notInitializedOption from './_get-option';

export default function getInputType(inputView, opts = {}){
	
	let valueType = notInitializedOption.call(inputView, 'valueType', opts);
	if (valueType == null) {
		let value = inputView.getControlValue();
		if ( value == null) {
			valueType = 'string';
		} else {
			if(_.isNumber(value))
				valueType = 'number';
			else if(_.isDate(value))
				valueType = 'datetime';
			else
				valueType = 'string';
		}		
	}

	if (valueType == 'number') {
		inputView._valueIsNumber = true;
	}

	let type = notInitializedOption.call(inputView, 'inputType', opts);

	if (!type) {
		if (inputView._valueIsNumber) {
			type = notInitializedOption.call(inputView, 'inputNumberType', opts) || 'number';
		} else if (valueType == 'string') {
			type = 'text';
		} else if (valueType == 'datetime') {
			type = 'datetime';
		} else {
			type = 'text';
		}
	}
	inputView.inputType = type;
	inputView.valueType = valueType;
	return type;
}
