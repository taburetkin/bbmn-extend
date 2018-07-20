import history from '../../../bb/history';
import errorHandler from '../route-error-handler';

// supports passing options to the callback
// by using new version of loadUrl
export function historyNavigate(fragment, opts){
	
	let options = opts === true ? { trigger: true }
		: _.isObject(opts) ? _.clone(opts)
			: {};

	let { trigger } = options;	
	delete options.trigger;

	history.navigate(fragment, options);

	if (trigger) {
		return historyLoadUrl(fragment, opts);
	}

}

// original loadUrl does not pass options to the callback
// and this one does
export function historyLoadUrl(fragment, opts = {}) {

	// If the root doesn't match, no routes can match either.
	if (!history.matchRoot()) return false;
	fragment = history.fragment = history.getFragment(fragment);
	let executed = executeHandler(fragment, opts);
	if (!executed) {
		errorHandler.handle('not:found', opts.context, [fragment]);
		//history.trigger('handler:not:found', fragment, opts);
	}
	return executed;
}

//TODO: think about constraints check
function testHandler(handler, fragment){
	return handler.route.test(fragment);
}

export function findHandler(fragment, customTest){
	let test = _.isFunction(customTest) ? customTest : testHandler;
	fragment = history.getFragment(fragment);
	return _.filter(history.handlers || [], handler => test(handler, fragment))[0];
}

export function executeHandler(fragment, opts = {}, resultContext = {}) {
	let handler = findHandler(fragment, opts.testHandler);
	handler && (resultContext.value = handler.callback(fragment, opts));
	return !!handler;
}

export function start(options){

	if(history.loadUrl !== historyLoadUrl)
		history.loadUrl = historyLoadUrl;

	return history.start(options);
}

export {
	history
};
