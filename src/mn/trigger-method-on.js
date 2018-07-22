import { triggerMethod } from 'backbone.marionette';

export default function triggerMethodOn(context, ...args) {
	if (_.isFunction(context.triggerMethod)) {
		return context.triggerMethod.apply(context, args);
	}

	return triggerMethod.apply(context, args);
}

//export default Mn.triggerMethodOn;
