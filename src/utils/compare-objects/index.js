export default function compareObjects(objectA, objectB) {

	if (!_.isObject(objectA) || !_.isObject(objectB)) {
		return objectA == objectB;
	}
	if ((_.isArray(objectA) && !_.isArray(objectB)) || (_.isArray(objectB) && !_.isArray(objectA))) {
		return false;
	}

	if (typeof objectA != typeof objectB) return false;

	let size = _.size(objectA);
	if(size != _.size(objectB)) return false;

	if (_.isArray(objectA)) {
		let allvalues = _.uniq(objectA.concat(objectB));
		return _.every(allvalues, value => {
			let valuesA = _.filter(objectA, _v => _v == value);
			let valuesB = _.filter(objectB, _v => _v == value);
			if (valuesA.length != valuesB.length) return false;
			return compareObjects(valuesA[0], valuesB[0]);
		});
	} else {
		let allkeys = _.uniq(_.keys(objectA).concat(_.keys(objectB)));
		if (allkeys.length != size) return false;
		return _.every(allkeys, key => {
			return compareObjects(objectA[key], objectB[key]);
		});
	}
}
