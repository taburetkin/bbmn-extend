import getOption from './_get-option';
export default function(eventContext) {
	let { context, event } = eventContext;

	if (event.keyCode == 13) {
		
		let shouldDone = getOption(context, 'doneOnEnter', true);
		if (shouldDone) {

			event.stopPropagation();
			event.preventDefault();
			context.controlDone();

		}

	}
}
