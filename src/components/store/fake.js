const _disallowedKeys = ['setItem', 'key', 'getItem', 'removeItem', 'clear'];
const allowedKey = key => _disallowedKeys.indexOf(key) < 0;

const fake = {
	setItem(id, val) {
		if (!allowedKey(id)) return;
		return this[id] = String(val);
	},
	getItem(id) {
		if (!allowedKey(id)) return;
		return this[id];
	},
	removeItem(id) {
		if (!allowedKey(id)) return;
		delete this[id];
	},
	clear() {
		let keys = _(this).keys();
		_(keys).each(key => this.removeItem(key));
	}
};

export default fake;
