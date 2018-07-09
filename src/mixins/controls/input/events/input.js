export default function(eventContext) {

	let { context, input, event } = eventContext;

	let newvalue = context.setControlValue(event.target.value);
	if (event.target.value != newvalue) {
		input.value = newvalue;
	}
	context.triggerControlChange();
}