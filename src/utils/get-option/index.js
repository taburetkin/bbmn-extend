import result from '../better-result';

export default function getOption(context, key, opts) {
	// if (_.isFunction(context.getOption)) {
	// 	return context.getOption(key, opts);
	// } else {
	// 	opts.context = context;
	// 	let fallback = _.isFunction(context.getProperty)
	// 		? context.getProperty
	// 		: key => context[key];
	// 	return getProperty(context.options, key, opts, fallback);
	// }

	let options = _.extend({}, opts, {
		context,
	});
	let { deep } = options;

	let value = result(context.options, key, options);
	if (value == null && deep !== false) {
		value = result(context, key, options);
	}
	return value;


}
