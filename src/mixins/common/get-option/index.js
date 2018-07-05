import getProperty from '../../../utils/get-property';

export default (Base) => Base.extend({
	//property first approach
	getProperty(key, options = {}){
		return getProperty(this, key, options, this.getOption);
	},
	//options first approach
	getOption(key, options = {}){
		options.context = this;
		return getProperty(this.getProperty('options',{deep:false}), key, options, this.getProperty);
	},
});
