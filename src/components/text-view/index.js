import { BackboneView } from '../../vendors/backbone.js';

export default BackboneView.extend({
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
	}
});
