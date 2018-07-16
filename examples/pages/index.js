
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
			this.on('all', (c, ...args) => console.log(c, this.cid, ...args));
		}
	});

	const Root = BasePage.extend({
		routes:'',
		relativeRoutes: false,
		shouldCreateRouter: true,		
		children:[
			BasePage.extend({
				routes:'asd/:id/:qwe',
				canNotStart(){
					return 'not:allowed';
				}
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

	let root = new Root();
	Backbone.history.start({ pushState: false });

	console.log(root);

});
