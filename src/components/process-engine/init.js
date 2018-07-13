import engine from './engine';
export default function initializeProcess(context, name, opts = {}){

	context[name] = function(...args){
		let processContext = _.extend({
			name,
			context,
			args,
		}, opts);
		return engine.process(processContext);
	};

}