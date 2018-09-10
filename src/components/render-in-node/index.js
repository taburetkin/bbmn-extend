import { Region } from '../../vendors/marionette';

export const config = {
	destroySelfOnEmpty: false,
	destroyOnEmpty: false,
};

const BaseNodeRegion = Region.extend({
	onEmpty() {
		let destroySelf = this.getOption('destroySelfOnEmpty') || this.getOption('destroyOnEmpty');
		let destroyNode = this.getOption('destroyOnEmpty');
		destroySelf && this.destroy();
		destroyNode && this.el.remove();
	}
});

config.Region = BaseNodeRegion;

function normalizeElement(selector) {
	let body = document.getElementsByTagName('body')[0];
	let el;
	if (selector == null) {
		selector = body;
	} else if(selector && selector.jquery){
		el = selector.get(0);
	} else if (_.isString(selector)) {
		el = document.querySelector(selector);
	}
	if (el instanceof Element) {
		return el;
	} else {
		throw new Error('el must be in Dom');		
	}
}

export default function showInNode(view, { el, replaceElement = false, destroySelfOnEmpty = config.destroySelfOnEmpty, destroyOnEmpty = config.destroyOnEmpty  } = {}) {
	const NodeRegion = config.Region;
	el = normalizeElement(el);
	const body = document.getElementsByTagName('body');
	if (el === body) {
		el = document.createElement('div');
		body.appendChild(el);
		replaceElement = true;
	}
	const region = new NodeRegion({ el, replaceElement, destroySelfOnEmpty, destroyOnEmpty });
	region.show(view);
}