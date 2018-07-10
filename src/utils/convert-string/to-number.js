export default function toNumber(text){
	if(_.isNumber(text)) return text;
	if(!_.isString(text)) return;
	
	let value = parseFloat(text, 10);
	return !isNaN(value) && value;
}
