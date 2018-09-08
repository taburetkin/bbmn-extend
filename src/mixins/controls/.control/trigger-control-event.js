export default function triggerControlEvent(control, event, options = {}){

	//let control = _control.getParentControl() || _control;

	let { proxyEvent, args = [] } = options;

	let name = control.getControlName();
	let eventName = 'control:' + event;
	let namedEventName = name + ':' + event;

	let method = _.isFunction(control.triggerMethod) ? control.triggerMethod
		: _.isFunction(control.trigger) ? control.trigger
			: function(){};

	method.call(control, eventName, ...args);
	if (eventName != namedEventName) {
		method.call(control, namedEventName, ...args);
	}


	!proxyEvent && control.proxyControlEventToParent(namedEventName, ...args);

}
