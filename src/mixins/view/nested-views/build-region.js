
const defaultSelector = (name, prefix = '') => prefix + 'region-' + name;

function defaultUpdateDom(name, $el)
{
	let selector = defaultSelector(name);
	$el.append($('<div>').addClass(selector));
	return '.' + selector;
}

export default function buildRegionFunc(view, hash, context){
	
	let { $el } = view;	
	let { autoCreateRegion } = context;
	let { updateDom, name, el } = hash;
	let regionEl;
	
	let region = view.getRegion(name);

	if ((el == null && !updateDom && autoCreateRegion !== false) || updateDom === true) {
		if(!region || (!$el.find(region.el).length))
			regionEl = defaultUpdateDom(name, $el);

	} else if(_.isFunction(updateDom)) {

		updateDom.call(view, $el, view);

	}

	
	if (!region) {
		let definition = _.pick(hash, 'replaceElement', 'regionClass');
		definition.el = hash.el || regionEl;
		region = view.addRegion(name, definition);
	}

	return region;
}