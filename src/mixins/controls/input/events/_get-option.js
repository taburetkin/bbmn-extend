import getOption from '../../../../utils/get-option/index.js';
export default (context, key, ifNull) => getOption(context, key, { args:[context], default: ifNull });

