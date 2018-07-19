export default function getDisplayConfig(key, model, schema){
	if (key == null) return {};
	return (_.isFunction(model.getPropertyDisplayConfig) && model.getPropertyDisplayConfig(key))
		|| (schema && schema.display) || {};
}