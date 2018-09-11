import rules from './rules.js';


function normalizeValidationContext(context){
	if (context === 'required') {
		return { required: true };
	} else if(_.isFunction(context)) {
		return { validate: context };
	} else if(_.isObject(context)) {
		return context;
	}
}

function getIndexedValidator(key) {
	for(let x = 0; x < rules.length; x++){
		let rule = rules[x];
		if (rule.name === key){
			return { rule, index: x };
		}
	}
}


function getValidators(rule = {}){
	let founded = _.reduce(rule, (validators, value, key) => {
		let validator = getIndexedValidator(key);
		if(!validator) { return validators; }
		validators[validator.index] = {
			customMessage: rule[key + 'Message'],
			[key]: value,
			rule: validator.rule
		};
		return validators;
	}, []);
	return _.filter(founded, f => !!f);
}

function check(value, allValues, { message, validate } = {}, customMessage) {
	if (!_.isFunction(validate)) return;
	let result = validate(value, allValues);
	if (!result) {
		return Promise.resolve(value);
	} else if(result && _.isFunction(result.then)) {
		return result.then(
			() => Promise.resolve(value),
			() => Promise.reject(customMessage || message)
		);
	} else {
		return Promise.reject(customMessage || message);
	}
}



function validate(value, rule = {}, opts = {}){
	rule = normalizeValidationContext(rule);
	let validators = getValidators(rule);
	_.each(validators, item => {
		//let validate = 
	});
}