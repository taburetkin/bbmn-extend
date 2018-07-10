export default function getNotInitializedOption(key, opts = {}){
	let value = opts[key] != null ? opts[key] : this[key];
	if (_.isFunction(value)) {
		let model = opts.model || this.model;
		value = value.call(this, model, this);
	}
	return value;
}
