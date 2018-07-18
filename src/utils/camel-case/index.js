// camelCase('asd:qwe:zxc') -> asdQweZxc
// camelCase('asd:qwe:zxc', true) -> AsdQweZxc
export default function camelCase(text, first) {
	if (!_.isString(text)) return text;
	var splitter = first === true ? /(^|:)(\w)/gi : /(:)(\w)/gi;
	text = text.replace(splitter, (match, prefix, text) => text.toUpperCase());
	if(!first)
		text = text.replace(/(^)(\w)/gi, (match, prefix, text) => text.toLowerCase());
	return text;
}