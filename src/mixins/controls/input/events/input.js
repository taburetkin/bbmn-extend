export default function(eventContext) {

	let { context, input, event } = eventContext;

	context.setControlValue(event.target.value).then(newvalue => {
		if (event.target.value != (newvalue || '').toString()) {
			input.value = newvalue;
		}
	});
	//context.triggerControlChange();
}
