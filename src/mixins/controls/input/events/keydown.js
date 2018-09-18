import getOption from './_get-option';
import isChar from './_is-char';
export default function(eventContext) {
	let { context, event } = eventContext;

	if (context.triggerMethod('keydown', event) === false) { return; }


	let prevent = false;
	let stop = false;

	if (isChar(event)) {
		if (!context.isEnteredCharValid(event.key)) {
			prevent = true;
		}
	}
	if(event.keyCode == 13 && getOption(context, 'doneOnEnter', true)){
		prevent = true;
		stop = true;
	}

	stop && event.stopPropagation();
	prevent && event.preventDefault();
}
