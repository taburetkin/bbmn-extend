export default function normalizeSetByPathOptions(opts = {}, ext)
{

	let options = _.extend({}, opts, ext, {
		silent: opts.silent === true,
		force: opts.force !== false,
		//passPath: [],
		models: []
	});

	return options;
}
