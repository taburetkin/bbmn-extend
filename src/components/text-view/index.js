import { BackboneView } from '../../vendors/backbone.js';
import triggerMethod from '../../utils/trigger-method/index.js';

export default BackboneView.extend({
	supportsDestroyLifecycle: true,

	constructor({ text } = {}){
		BackboneView.apply(this, arguments);
		this.setText(text);
	},
	render(){
		this.$el.html(this.text);
		this._isRendered = true;
		return this;
	},
	isRendered(){
		return this._isRendered === true;
	},
	setText(text){
		this.text = text;
		if(this.isRendered()) {
			this.render();
		}
	},
	triggerMethod,
	destroy(){
		if(this._isDestroyed || this._isDestroying) { return; }
		this._isDestroying = true;

		this.triggerMethod('before:destroy', this);
		
		if (this._isAttached) {
			this.triggerMethod('before:detach', this);
		}
		
		this.remove();
		
		if (this._isAttached) {
			this._isAttached = false;
			this.triggerMethod('detach', this);
		}
		
		this._isDestroyed = true;
	
		this.triggerMethod('destroy', this);
	}
});
