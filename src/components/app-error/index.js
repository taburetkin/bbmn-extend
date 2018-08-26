import extend from '../../utils/extend';
const errorProps = ['description', 'fileName', 'lineNumber', 'name', 'message', 'number', 'url'];
function normalizeAppErrorOptions(data = {}){
	if(_.isString(data)){
		data = { message: data };
	}
	return data;
}
const AppError = extend.call(Error, {
	urlRoot: '',
	url: '',
	name: 'app:error',
	constructor(options){
		if (!(this instanceof AppError)) {
			return new AppError(_.extend({},options,{ newKeywordOmited: true }));
		}
		options = normalizeAppErrorOptions(options);
		const error = Error.call(this, options.message);
		const important = {
			name: options.name || this.name,
			message: options.message || this.message,
			url: options.url || this.url,
		};
		options.name = important.name;
		_.extend(this, important, _.pick(error, errorProps), options);
	
		if (Error.captureStackTrace) {
			this.captureStackTrace();
		}
		if (options.url) 
			this.url = this.urlRoot + this.url;
	},	
	captureStackTrace(){
		Error.captureStackTrace(this, this.constructor);
	},
	toString() {
		let url = this.url ? ` See: ${ this.url }` : '';
		return `${ this.name }: ${ this.message }${url}`;
	}
});
// AppError.setUrlRoot = function(url){
// 	this.prototype.urlRoot = url;
// };
AppError.extend = extend;


export default AppError;
