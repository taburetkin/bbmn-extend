export default function(eventContext) {

	let { context, input, event } = eventContext;

	let newvalue = context.setControlValue(event.target.value);
	if (event.target.value != (newvalue || '').toString()) {
		input.value = newvalue;
	}
	//context.triggerControlChange();
}
