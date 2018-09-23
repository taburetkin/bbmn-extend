import rules, { reIndex } from './rules.js';

import isEmptyValue from '../../utils/is-empty-value/index.js';

import validate from './validate.js';

function removeRule(name){
	let found = _.findIndex(rules, { name });
	if (found === -1) return;
	let removed = rules.splice(found, 1);
	reIndex();
	return removed;
}

function setRule(rule){
	rules.push(rule);
	reIndex();
	return rule;
}

export default {
	setRule(name, rule){
		if(isEmptyValue(rule)) return;

		if(rule == null){
			return removeRule(name);
		} else if (!_.isObject(rule)) {
			throw new Error('validation rule must be an object');
		} else {
			rule.name = name;
			return setRule(rule);
		}
	},
	removeRule(name) {
		return removeRule(name);
	},
	getRule(name){
		return _.findWhere(rules, { name });
	},
	setMessage(name, message){
		if(!_.isString(name) || isEmptyValue(name)) {
			throw new Error('name must be not empty string');
		}
		if(!(_.isString(message) || _.isFunction(message))) {
			throw new Error('message must be not empty string or a function returning a string');
		}
		let rule = _.findWhere(rules, { name });
		if (!rule) { return; }
		rule.message = message;
	},
	setMessages(hash = {}){
		_.each(hash, (message, name) => this.setMessage(name, message));
	},
	validate
};
