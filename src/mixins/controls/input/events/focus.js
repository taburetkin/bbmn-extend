import getOption from './_get-option';
export default function(eventContext) {
	let { context } = eventContext;
	if (getOption(context, 'selectOnFocus', true)) {
		context.el.select();
	}
}