import mix from '../../utils/mix';

// const Process = function(name, context, opts){
// 	this.cid = _.uniqueId('process');
// 	this.name = name;
// 	this.context = context;
// 	this.errors = [];
// 	this._initCancelation();
// 	this._mergeOptions(opts);
// };
// _.extend(Process.prototype, {
// 	_initCancelation(){
// 		let cancelation = {};
// 		cancelation.promise = new Promise((resolve, reject) => {
// 			cancelation.cancel = () => reject('cancel'); 
// 		});
// 		this.cancelation = cancelation;
// 	},
// 	_mergeOptions(opts = {}){
// 		let options = _.omit(opts, 'cid', 'name', 'context', 'cancelation', 'errors');
// 		_(options).each((value, key) => this[key] = value);
// 	}
// });


const Process = mix({
	constructor: function Process(name, context, opts){
		this._initDefaults(name, context);
		this._initCancelation();
		this._mergeOptions(opts);
	},
	_initDefaults(name, context){
		if(name == null || name === '')
			throw new Error('Process requires two arguments: name [string], context [object]. name missing');
		
		if(!_.isObject(context))
			throw new Error('Process requires two arguments: name [string], context [object]. context is not an object');

		this.cid = _.uniqueId('process');
		this.name = name;
		this.context = context;
		this.errors = [];
	},
	_initCancelation(){
		let cancelation = {};
		cancelation.promise = new Promise((resolve, reject) => {
			cancelation.cancel = () => reject('cancel'); 
		});
		this.cancelation = cancelation;
	},
	_mergeOptions(opts = {}){
		let options = _.omit(opts, 'cid', 'name', 'context', 'cancelation', 'errors');
		_(options).each((value, key) => this[key] = value);
	}
}).class;

console.log(Process);


export default Process;
