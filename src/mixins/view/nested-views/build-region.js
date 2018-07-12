
const defaultSelector = (name, prefix = '') => prefix + 'region-' + name;

function defaultUpdateDom(name, $el)
{
	let selector = defaultSelector(name);
	let element = $('<div>').addClass(selector);
	$el.append(element);

	return '.' + selector;
}

export default function buildRegionFunc(view, hash, context){

	let { $el } = view;	
	let { autoCreateRegion } = context;
	let { updateDom, name, el } = hash;
	let regionEl;
	
	let region = view.getRegion(name);


	if (el == null && autoCreateRegion !== false) {

		let testEl = region && region.getOption('el',{ deep:false});

		if (!region || !testEl || !$el.find(testEl).length) {

			regionEl = defaultUpdateDom(name, $el);

		} 

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
