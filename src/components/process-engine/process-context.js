

export default function createProcessContext(context, name, args = [], opts = {}){

	let cancelation = {};
	cancelation.promise = new Promise((resolve, reject) => {
		cancelation.cancel = () => reject('cancel'); 
	});


	let result = _.extend({
		cid: _.uniqueId('process'),
		name,
		context,
		args,
		errors:[],
		waitPromises:[],
		cancelation,		
	}, opts);

	return result;
}
