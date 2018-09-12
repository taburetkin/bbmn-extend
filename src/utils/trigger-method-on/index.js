import triggerMethod from '../trigger-method/index.js';

export default function triggerMethodOn(context, event, ...args) {
	return triggerMethod.call(context, event, ...args);
}
