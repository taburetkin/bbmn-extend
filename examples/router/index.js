
console.log('bbmn', bbmn);
$(() => {

	let bb = false;
	const Router = bb ? Backbone.Router : bbmn.components.Router;

	const router = new Router();

	let log = (...args) => console.log('route callback: ', ...args);

	router.route('', log);
	router.route('asd', log);
	router.route('asd/:qwe', () => { return Promise.reject('bla-bla'); });

	router.on('all', (name,...args) => console.log('	router event:', `"${name}"`, ...args));
	//Backbone.history.on('all', (name,...args) => console.log('	history event:', `"${name}"`, ...args));

	const watcher = bbmn.components.historyWatcher;
	watcher.watch();
	Backbone.history.start();

	window.router = router;
	const navi = bbmn.components.navigator;
	window.gogo = path => navi.navigate(path);
	window.goback = () => watcher.goBack();


});
