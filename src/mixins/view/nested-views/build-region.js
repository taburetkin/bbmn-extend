function defaultUpdateDom(name, $el)
{
	let selector = 'region-' + name;
	$el.append($('<div>').addClass(selector));
	return '.' + selector;
}

export default function buildRegionFunc(view, hash, context){
	
	let { $el } = view;	
	let { autoCreateRegion } = context;
	let { updateDom, name, el } = hash;
	let regionEl;

	if ((el == null && !updateDom && autoCreateRegion !== false) || updateDom === true) {

		regionEl = defaultUpdateDom(name, $el);

	} else if(_.isFunction(updateDom)) {

		updateDom.call(view, $el, view);

	}

	let region = view.getRegion(name);
	if (!region) {
		let definition = _.pick(hash, 'replaceElement', 'regionClass');
		definition.el = hash.el || regionEl;
		region = view.addRegion(name, definition);
	}

	return region;
}