import buildRegion from './build-region';

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

		context.region = _.partial(buildRegion, this, region, context);
	}
	return context;
}