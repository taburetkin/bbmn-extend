import { MnObject } from '../../vendors/marionette';
const base = MnObject.prototype;
export default {
	getOption: base.getOption,
	mergeOptions: base.mergeOptions,
	triggerMethod: base.triggerMethod,
};
