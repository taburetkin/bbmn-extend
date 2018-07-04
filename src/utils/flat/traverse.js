import isModel from '../../bb/is-model';
export default function traverse(fields, root)
{
	root = root || '';
	if (this == null || typeof this != 'object') {
		return;
	}

	var hash = isModel(this) ? this.attributes : this;

	var props = Object.getOwnPropertyNames(hash);

	for (var x = 0; x < props.length; x++) {
		var name = props[x];
		var prop = this[name];

		if (prop == null || typeof prop != 'object' || (prop instanceof Date || prop instanceof Array)) {

			fields[root + name] = prop;
		}
		else if (typeof prop == 'object') {

			traverse.call(prop, fields, root + name + '.');
		}
	}
		
}