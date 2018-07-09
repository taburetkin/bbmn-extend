import getOption from './_get-option';
export default function(eventContext) {
	let { context, event } = eventContext;

	if(event.keyCode == 13 && getOption(context, 'doneOnEnter', true)){
		context.triggerControlDone();
		event.stopPropagation();
		event.preventDefault();
	}
}