import getInputType from './get-input-type';
import notInitializedOption from './_get-option';
export default function setInputAttributes(inputView, opts = {}) {

	let attributes = notInitializedOption.call(inputView, 'attributes', opts);
	
	let buildedAttributes = {
		value: inputView.value,
		type: getInputType(inputView, opts),
	};
	inputView.attributes = () => _.extend(buildedAttributes, attributes);
}
