import Mn, { triggerMethod as _triggerMethod }  from 'backbone.marionette';

const MnObject = Mn.Object || Mn.MnObject;

const triggerMethod = _triggerMethod || Mn.triggerMethod;

export {
	MnObject,
	triggerMethod,
};
