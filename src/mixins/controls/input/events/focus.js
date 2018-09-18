import getOption from './_get-option';
export default function(eventContext) {
	let { context, input } = eventContext;

	if (context.triggerMethod('focus', event) === false) { return; }

	if (getOption(context, 'selectOnFocus', true)) {
		input.select();
	}
}
