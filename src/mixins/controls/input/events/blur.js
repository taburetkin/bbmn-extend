import getOption from './_get-option';
export default function(eventContext) {
	let { context } = eventContext;
	if (getOption(context, 'doneOnBlur', true)) {
		context.controlDone();
	}
}
