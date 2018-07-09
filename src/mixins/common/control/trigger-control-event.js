export default function triggerControlEvent(control, event, ...args){

	//let control = _control.getParentControl() || _control;

	let name = control.getControlName();
	let eventName = name + ':' + event;
	let method = _.isFunction(control.triggerMethod) ? control.triggerMethod
		: _.isFunction(control.trigger) ? control.trigger
			: function(){};
	method.call(control, eventName, ...args);
	

	control.proxyControlEventToParent(eventName, ...args);

}
