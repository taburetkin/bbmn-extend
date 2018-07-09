import getOption from '../../../utils/get-option';
import getInputType from './get-input-type';

export default function setInputAttributes(inputView) {
	
	let passedAttributes = getOption(inputView, 'attributes', { args: [inputView.model, inputView] });
	let buildedAttributes = {
		value: inputView.value,
		type: getInputType(inputView),
	};
	inputView.attributes = () => _.extend(buildedAttributes, passedAttributes);
}
