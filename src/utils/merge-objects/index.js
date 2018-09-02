import { flat, unflat } from '../index.js';

export default function mergeObject(src, dst){
	if (!_.isObject(src) || !_.isObject(dst)) {
		return dst;
	}
	let flatSrc = flat(src);
	let flatDst = flat(dst);
	_.each(flatDst, (value, key) => {
		flatSrc[key] = value;
	});
	return unflat(flatSrc);
}
