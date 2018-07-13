import triggerMethodOn from '../../mn/trigger-method-on';
import camelCase from '../../utils/camel-case';

function executingProcessFlagKey(name){
	return camelCase(`_process:${name}:executing`);
}

const ProcessEngine = {

	process(processContext){
		let executingKey = executingProcessFlagKey(processContext.name);
		let previous = processContext.context[executingKey];
		let concurent = processContext.concurent;		
		if (previous) {
			if (concurent === false) {
				return Promise.reject(new Error('concurent process not allowed'));
			} else if (concurent == 'first') {
				return previous.promise;
			} else if (concurent == 'last') {
				previous.reject();
			}
		}
	
		processContext.promise = new Promise((resolve, reject) => {

			processContext.resolve = resolve;
			processContext.reject = reject;

			this.triggerBegin(processContext);


			let endWithErros = (...errors) => {
				this.triggerErrors(processContext, errors);
				this.triggerEnd(processContext, true);
				return errors;
			};

			
			return this.canNotRun(processContext).then(
				() => {
					this.triggerBefore(processContext);

					let waitFor = this.getPromises(processContext);
					if(waitFor != null && !_.isArray(waitFor))
						waitFor = [waitFor];
					
					return Promise.all(waitFor).then(
						() => this.triggerEnd(processContext),
						endWithErros
					);
				},
				endWithErros
			);

			
		});
		

		return processContext.promise;
	},

	_triggerOnContext (processContext, eventName, args) {
		let event = processContext.name + (eventName ? ':' + eventName : '');
		
		//subject of process: view, model or whatever that initiate the process.
		let context = processContext.context; 
		
		// passing process arguments or suplied ones
		!args && (args = processContext.args);

		triggerMethodOn(context, event, ...args);
	},

	_invokeOnContext(processContext, methodName)
	{
		let method = camelCase(methodName);
		let context = processContext.context;
		let args = processContext.args;

		if (!_.isFunction(context[method])) {
			return;
		}
		return context[method].apply(context, args);
	},
	triggerBegin(processContext){
		let key = executingProcessFlagKey(processContext.name);
		processContext.context[key] = processContext;		
		this._triggerOnContext(processContext, 'begin');
	},
	triggerBefore(processContext){
		this._triggerOnContext(processContext, 'before');
	},
	triggerEnd(processContext, fail){
		if(!fail)
			this._triggerOnContext(processContext, '');
		this._triggerOnContext(processContext, 'end');
		if (fail)
			processContext.reject();
		else
			processContext.resolve();
		processContext.ended = true;
		let key = executingProcessFlagKey(processContext.name);
		delete processContext.context[key];
	},	
	triggerErrors(processContext, errors){
		let args = [errors, processContext.args];
		this._triggerOnContext(processContext, 'error', args);
	},
	// return: promise
	// invokes on context method `canNot{ProcessName}` and expect it returns:
	// undefined, Promise, Array of promises, Error Object
	// undefined will resolve and Error will reject
	canNotRun(processContext) {		
		let canNotRunPromise = this._invokeOnContext(processContext, 'can:not:' + processContext.name);
		if (canNotRunPromise == null) {
			return Promise.resolve();
		} else if (canNotRunPromise instanceof Error) {
			return Promise.reject(canNotRunPromise);
		}

		if(!_.isArray(canNotRunPromise))
			canNotRunPromise = [canNotRunPromise];

		return Promise.all(canNotRunPromise);

	},

	getPromises(processContext)
	{
		let promises = this._invokeOnContext(processContext, 'get:' + processContext.name + ':promises');
		if (promises == null) return [];
		if (!_.isArray(promises))
			promises =[promises];

		return promises;
	},


};

export default ProcessEngine;
