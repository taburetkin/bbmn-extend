
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

	
	const navi = bbmn.components.navigator;
	const watcher = bbmn.components.historyWatcher;
	const errorHandler = bbmn.components.routeErrorHandler;

	window.gogo = path => navi.navigate(path);
	window.goback = () => watcher.goBack();



	errorHandler.setHandlers({
		'not:found':() => navi.execute('{notfound}'),
		'not:allowed':() => navi.execute('{notallowed}'),
		'execute':(fragment) => navi.execute(fragment)
	});

	let Layout = Mn.View.extend({
		el:'body',
		template:_.noop,
		regions:{
			'content':'section'
		},
	});
	let layout = new Layout();
	layout.render();


	let Preloader = Mn.View.extend({
		className: 'page-preloader',
		template:() => '<div>please wait, loading...</div>',
		onBeforeRender(){
			this.$el.appendTo($('body'));
		}
	})


	const BasePage = bbmn.components.Page.extend({
		relativeRoutes: true,
		initialize(){
			this.on('all', (c, ...args) => console.log('page:', c));
		},
		onBeforeStart(){
			return prom(500);
		},
		onStart(){
			let view = new Mn.View({
				template: `#${this.templateId}`
			});
			layout.showChildView('content',view);
		},
		onEndStart(){
			this.hidePreloader();
		},
		onBeginStart(){
			if(!layout.isRendered()) return;
			let region = layout.getRegion('content');
			region.empty();

			this.showPreloader();
			//layout.emptyChildView('content');
		},
		showPreloader(){
			this.preloader = new Preloader();
			this.preloader.render();
		},
		hidePreloader(){
			if(!this.preloader) return;
			this.preloader.destroy();
			delete this.preloader;
		}
	});

	const Root = BasePage.extend({
		routes:'root',
		relativeRoutes: false,
		shouldCreateRouter: true,
		templateId:'root',
		children:[
			BasePage.extend({
				relativeRoutes:false,
				routes:'{notallowed}',
				templateId:'notallowed',
			}),
			BasePage.extend({
				relativeRoutes:false,
				routes:'{notallowed2}',
				templateId:'notallowed2',
			}),			
			BasePage.extend({
				relativeRoutes:false,
				routes:'{notfound}',
				templateId:'notfound',
			}),
			BasePage.extend({
				relativeRoutes:false,
				routes:'{notfound2}',
				templateId:'notfound2',
			}),					
			BasePage.extend({
				routes:'cats',
				templateId:'cats',
			}),			
			BasePage.extend({
				routes:'auth2',				
				canNotStart(){
					return ['execute','{notallowed2}'];
				},
			}),
			BasePage.extend({
				routes:'auth',				
				canNotStart(){
					return 'not:allowed';
				},
			}),			
			BasePage.extend({
				routes:'fake-404',
				templateId:'notfound',
				canNotStart(){
					return ['execute','{notfound2}'];
				},
			}),
		]
	});


	let root = new Root();
	root.router.on('all', (c,a) => console.log('router:', c, a));
	window.router = root.router;
	
	watcher.watch();
	bbmn.components.history.start();



});
