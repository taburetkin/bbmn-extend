export default function(eventContext) {
	let { context, event } = eventContext;
	let text = event.originalEvent.clipboardData.getData('text/plain');
	if (!text) return;
	if (!context.isValueValid(text)) {
		event.preventDefault();
		event.stopPropagation();
	}
}
