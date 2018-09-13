import { buildViewByKey } from '../../../utils/index.js';
export default Base => Base.extend({
	buildViewByKey(...args){
		return buildViewByKey.call(this, ...args);
	},
});
