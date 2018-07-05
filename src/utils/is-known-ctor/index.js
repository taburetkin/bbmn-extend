import knownCtors from './ctors';

function isKnownCtor(arg) {
	let isFn = _.isFunction(arg);
	let result = _(knownCtors).some((ctor) => arg === ctor || arg.prototype instanceof ctor);
	return isFn && result;
}

export default isKnownCtor;
