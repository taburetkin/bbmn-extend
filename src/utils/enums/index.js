import getFlag from '../get-flag/index.js';
import hasFlag from '../has-flag/index.js';
import getByPath from '../get-by-path/index.js';
import setByPath from '../set-by-path/index.js';
import isEmptyValue from '../is-empty-value/index.js';
export const enumsStore = {};

function getEnum(arg){
	if(isEmptyValue(arg)){
		return {};
	} else if(_.isString(arg)){
		return getByPath(enumsStore, arg) || {};
	} else if(_.isObject(arg)){
		return arg;
	}
}

export function get(arg, flag, options){
	let _enum = getEnum(arg);
	return getFlag(_enum, flag, options);
}

export function has(arg, flag, options){
	let _enum = getEnum(arg);
	return hasFlag(_enum, flag, options);
}

export default {
	get,
	has,
	set(name, hash){
		if(_.isString(name)){
			setByPath(enumsStore, name, hash);
		} else if (_.isObject(name)){
			_.extend(enumsStore, name);
		}
	},
};
