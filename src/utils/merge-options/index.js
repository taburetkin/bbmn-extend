export default function mergeOptions(options, keys) {
	if (!options) { return; }
  
	_.each(keys, key => {
		const option = options[key];
		if (option !== undefined) {
			this[key] = option;
		}
	});
}
