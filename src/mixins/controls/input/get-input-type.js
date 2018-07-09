import getOption from '../../../utils/get-option';
export default function getInputType(inputView){
	
	let valueType = getOption(inputView, 'valueType', { args:[inputView.model, inputView] });
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

	let type = getOption(inputView, 'inputType', { args:[inputView.model, inputView] });

	if (!type) {
		if (inputView._valueIsNumber) {
			type = getOption(inputView, 'inputNumberType', { args:[inputView.model, inputView] }) || 'number';
		} else if (valueType == 'string') {
			type = 'text';
		} else if (valueType == 'datetime') {
			type = 'datetime';
		} else {
			type = 'text';
		}
	}
	
	return type;
}
