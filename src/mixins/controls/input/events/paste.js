export default function(eventContext) {
	let { context, event } = eventContext;
	let text = event.originalEvent.clipboardData.getData('text/plain');
	if (!text) return;
	let type = context.getValueType();
	if (type == 'number' && isNaN(parseFloat(text, 10))) {
		event.preventDefault();
		event.stopPropagation();
	}
}