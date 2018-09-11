export default Base => Base.extend({
	destroy(){
		if(this._isDestroyed || this._isDestroying) { return; }
		this._isDestroying = true;
		Base.prototype.destroy.apply(this, arguments);
		delete this._isDestroying;
	},
	isDestroyed(){
		return this._isDestroyed || this._isDestroying;
	}
}, { DestroyMixin: true });
