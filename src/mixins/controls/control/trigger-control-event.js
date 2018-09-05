export default function triggerControlEvent(control, event, ...args){

	//let control = _control.getParentControl() || _control;

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


	control.proxyControlEventToParent(namedEventName, ...args);

}
