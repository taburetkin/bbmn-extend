import getOption from '../../../../utils/get-option';
export default (context, key, ifNull) => getOption(key, { args:[context], default: ifNull });

