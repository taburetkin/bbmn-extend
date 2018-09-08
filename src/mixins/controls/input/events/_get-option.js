import getOption from '../../../../utils/get-option';
export default (context, key, ifNull) => getOption(context, key, { args:[context], default: ifNull });

