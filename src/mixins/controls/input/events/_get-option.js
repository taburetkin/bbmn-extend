//import getOption from '../../../../utils/get-option';
import { getOption } from '../../../../utils/index.js';
export default (context, key, ifNull) => getOption(context, key, { args:[context], default: ifNull });

