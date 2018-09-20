import buildRegion from './build-region.js';

export default function normalizeNestedViewContextRegion(context) {

	let { region } = context;
	let regionName = (_.isString(region) && region) || context.regionName || context.name;

	if (_.isString(region) || region == null) {
		region = {};
	} else if (_.isFunction(region)) {
		region = region.call(this, context, this);
	}

	if (_.isObject(region)) {

		if(!region.name)
			region.name = regionName;
		let replaceElement = this.getOption('replaceNestedElement');
		context.region = _.extend({ replaceElement }, region);
		context.show = _.partial(buildRegion, this, context.region, context);
	}
	return context;
}
