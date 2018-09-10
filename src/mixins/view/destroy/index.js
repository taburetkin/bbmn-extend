export default Base => Base.extend({
	destroy(){
		if(this._isDestroyed || this._isDestroying) { return; }
		Base.prototype.destroy.apply(this, arguments);
		delete this._isDestroying;
	}
});
