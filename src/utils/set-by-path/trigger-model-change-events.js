export default function triggerModelEventsOnSetByPath(value, options = {})
{
	if (options.silent || !options.models.length) {
		return;
	}
	
	_(options.models).each(context => {
		let rest = context.pathChunks.join(':');
		if (rest) {
			context.model.trigger(`change:${context.property}:${rest}`, context.model, value);
		}
		context.model.trigger(`change:${context.property}`, context.model, value);
		context.model.trigger('change', context.model);
	});

	// //triggering change event on all met models
	// let originPath = options.pathArray.join(':');
	// while (options.models.length) {
	// 	let modelContext = options.models.pop();
	// 	let propertyEventName = modelContext.path == ''
	// 		? originPath
	// 		: originPath.substring(modelContext.path.length + 1);

	// 	if (propertyEventName) {
	// 		modelContext.model.trigger('change:' + propertyEventName, value);
	// 	}
	// 	modelContext.model.trigger('change', modelContext.model);
	// }
}
