
console.log('bbmn', bbmn);
$(() => {

	let bb = false;
	const Router = bb ? Backbone.Router : bbmn.components.Router;

	const router = new Router();

	let log = (...args) => console.log('route callback: ', ...args);

	router.route('', log);
	router.route('asd', log);
	router.route('promise-error', () => { return Promise.reject('bla-bla'); });
	router.route('js-error', () => { throw new Error('some js error') });
	router.route('jq-xhr-error', () => { return $.get() });


	router.on('all', (name,...args) => console.log('	router event:', `"${name}"`, ...args));
	//Backbone.history.on('all', (name,...args) => console.log('	history event:', `"${name}"`, ...args));

	const watcher = bbmn.components.historyWatcher;
	const errorhandler = bbmn.components.routeErrorHandler;

	errorhandler.setHandler('bla-bla', (...args) => console.warn('blabla:', ...args));

	watcher.watch();
	bbmn.components.history.start();

	

	window.router = router;
	const navi = bbmn.components.navigator;
	window.gogo = path => navi.navigate(path);
	window.goback = () => watcher.goBack();


});
