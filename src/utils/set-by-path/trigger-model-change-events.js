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

}
