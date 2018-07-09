import handleEvent from './handle-event';
import eventHandlers from './events';
import notInitializedOption from './_get-option';
export default function setInputEvents(inputView, opts = {}) {

	let passedEvents = notInitializedOption.call(inputView, 'events', opts);	

	let eventsArray = _(eventHandlers).keys();	
	let events = _.reduce(eventsArray, (Memo, eventName) => {
		Memo[eventName] = function(event){ 
			handleEvent(this, eventName, event); 
		};
		return Memo;
	}, {});
	inputView.events = _.extend(events, passedEvents);
}
