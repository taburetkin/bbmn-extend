import camelCase from '../../../utils/camel-case';
import events from './events';
export default function handleInputEvent(control, eventName, event) {
	let options = _.extend({
		context: control,
		input: control.el,
		restrictions: control.restrictions,
		eventName,
		event
	});


	let method = camelCase(`on:dom:${eventName}`);

	if (_.isFunction(events[eventName])) {
		events[eventName].call(control, options);
	} 
	
	if (_.isFunction(control[method])) {
		control[method](event, options);
	} 
}