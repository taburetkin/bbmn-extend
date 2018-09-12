import handleEvent from './handle-event.js';
import eventHandlers from './events/index.js';
//import getOption from '../../../utils/get-option';
import { getOption } from '../../../utils/index.js';

const _getOption = (context, key, checkAlso) => 
	getOption(context, key, { args:[context], checkAlso });

export default function setInputEvents(inputView, opts = {}) {

	let passedEvents = _getOption(inputView, 'events', opts);	

	let eventsArray = _(eventHandlers).keys();	
	let events = _.reduce(eventsArray, (Memo, eventName) => {
		Memo[eventName] = function(event){ 
			handleEvent(this, eventName, event); 
		};
		return Memo;
	}, {});
	inputView.events = _.extend(events, passedEvents);
}
