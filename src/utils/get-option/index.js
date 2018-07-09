import getProperty from '../get-property';
export default function getOption(context, key, opts = {}) {
	if (_.isFunction(context.getOption)) {
		return context.getOption(key, opts);
	} else {
		opts.context = context;
		let fallback = _.isFunction(context.getProperty)
			? context.getProperty
			: key => context[key];
		return getProperty(context.options, key, opts, fallback);
	}
}
