export default function getInputOption(context, key, ifNull){
	let value = context.getOption(key, {args:[context.model, context]});
	if (value == null) {
		value = ifNull;
	}
	return value;
}