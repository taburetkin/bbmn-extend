
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
			catchPromiseErrors: true
		},
		children:[
			BasePage.extend({
				routes:'qqqq',				
			}),
			BasePage.extend({
				routes:'asd/:id/:qwe',
				canNotStart(){
					//throw new Error('bla bla bla');
					return ['execute','asd/qwe'];
				},
				// onStart(){
				// 	//a = new Mn.Asd()
				// }
			})
		]
	});

	// var Router = bbmn.components.Router.extend({
	// 	routes:{
	// 		'asd/:id/:cid'(){
	// 			console.log(arguments);
	// 		}
	// 	},
	// });
	// var router = new Router();

	// let originalCheckUrl = Backbone.history.checkUrl;
	// Backbone.history.checkUrl = function(e) {
	// 	console.log('* check-url *');
	// 	originalCheckUrl.call(this, e);
  	// }

	// let hoBack = history.back;
	// history.back = function(){
	// 	console.log('* back *');
	// 	return hoBack.apply(this, arguments);
	// }
	// let hoForward = history.forward;
	// history.forward = function(){
	// 	console.log('* forward *');
	// 	return hoForward.apply(this, arguments);
	// }

	// let hoGo = history.go;
	// history.go = function(){
	// 	console.log('* go *');
	// 	return hoGo.apply(this, arguments);
	// }

	// window.addEventListener('popstate', function (e) {
	// 	console.log('* popstate *', e);
	// });	

	let root = new Root();
	root.router.on('all', (c,a) => console.log('router:', c, a));
	Backbone.history.on('all', c => console.log('history:', c));
	bbmn.components.historyWatcher.watch();
	Backbone.history.start({ pushState: false });
	window.router = root.router;
	window.nav = bbmn.components.navigator;
	//console.log(root);

});
