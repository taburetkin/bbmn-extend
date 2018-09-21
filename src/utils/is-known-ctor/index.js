import knownCtors from './ctors.js';

function isKnownCtor(arg) {
	let isFn = _.isFunction(arg);
	let result = _(knownCtors).some((ctor) => arg === ctor || arg.prototype instanceof ctor);
	return isFn && result;
}

export default isKnownCtor;
