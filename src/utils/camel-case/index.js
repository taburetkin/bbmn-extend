// camelCase('asd:qwe:zxc') -> asdQweZxc
// camelCase('asd:qwe:zxc', true) -> AsdQweZxc
export default function camelCase(...args) {
	
	let text;
	let first;

	if (!args.length) return;
	else if (args.length == 1) {
		text = args[0];
	} else {
		if(_.isBoolean(args[args.length - 1])){
			first = args.pop();
		}
		text = _.filter(args, chunk => chunk != null).join(':');
	}

	if (!text) return text;

	if (!_.isString(text)) return text.toString();
	text = text.replace(/:{2,}/gmi,':');
	var splitter = first === true ? /(^|:)(\w)/gi : /(:)(\w)/gi;
	text = text.replace(splitter, (match, prefix, text) => text.toUpperCase());
	if(!first)
		text = text.replace(/(^)(\w)/gi, (match, prefix, text) => text.toLowerCase());
	return text;

}
