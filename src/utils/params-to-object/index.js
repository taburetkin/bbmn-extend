function pstoSetPair(context, pair){
	if(!_.isString(pair)) return;
	let keyvalue = pair.split('=');
	let key = keyvalue.shift();
	let value = keyvalue.join('=');
	pstoSetKeyValue(context, key, value);
}

function pstoSetKeyValue(context, key, value){
		
	if (key == null) return;
	key = decodeURIComponent(key);
	value != null && (value = decodeURIComponent(value));

	if(!(key in context))
		return (context[key] = value);

	!_.isArray(context[key]) && (context[key] = [context[key]]);

	context[key].push(value);

	return context[key];
}

export default function paramsToObject(raw, opts = {emptyObject: true}){
	let result = {};
	if(!_.isString(raw)) return opts.emptyObject ? result : raw;

	let pairs = raw.split('&');
	_(pairs).each((pair) => pstoSetPair(result, pair));
	
	return result;
}
