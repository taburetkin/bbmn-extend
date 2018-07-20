
console.log('bbmn', bbmn);

function prom (delay, error) {
	let id = _.uniqueId('p');
	return new Promise((resolve,reject) => {
		setTimeout(() => {
			console.log('	>', id);
			if(error)
				reject(error);
			else
				resolve();
		}, delay);
	});
}


$(() => {

	const BasePage = bbmn.components.Page.extend({
		relativeRoutes: true,
		initialize(){
			this.on('all', (c, ...args) => console.log('page:', c));
		},
		onStart(){
			console.log('page:started', this.cid, this.routes);
		},
		onStartError(){
			console.log('page:errored', this.cid, arguments);
		}
	});

	const Root = BasePage.extend({
		routes:'',
		relativeRoutes: false,
		shouldCreateRouter: true,
		routerOptions:{
			catchPromiseErrors: true,			
		},
		children:[
			BasePage.extend({
				routes:'{notallowed}',
				onStart() { console.warn('not allowed') },
			}),
			BasePage.extend({
				routes:'{notfound}',
				onStart() { console.warn('not found') },
			}),			
			BasePage.extend({
				routes:'auth',
				canNotStart(){
					return ['execute','{notallowed}'];
				},
			}),
			BasePage.extend({
				routes:'fake-404',
				canNotStart(){
					return ['execute','{notfound}'];
				},
			}),
		]
	});


	let root = new Root();

	root.router.on('all', (c,a) => console.log('router:', c, a));
	//Backbone.history.on('all', c => console.log('history:', c));

	window.router = root.router;
	window.nav = bbmn.components.navigator;
	const navi = bbmn.components.navigator;
	const watcher = bbmn.components.historyWatcher;
	const errorHandler = bbmn.components.routeErrorHandler;
	watcher.watch();
	bbmn.components.history.start();

	//Backbone.history.start();
	window.gogo = path => navi.navigate(path);
	window.goback = () => watcher.goBack();


	//console.log(root);

});
