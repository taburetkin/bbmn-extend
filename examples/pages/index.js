
console.log('bbmn', bbmn);




$(() => {

	
	const navi = bbmn.components.navigator;
	const watcher = bbmn.components.historyWatcher;
	const errorHandler = bbmn.components.routeErrorHandler;

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

	window.gogo = path => navi.navigate(path);
	window.goback = () => watcher.goBack();



	errorHandler.setHandlers({
		'not:found':() => navi.execute('{notfound}'),
		'not:allowed':() => navi.execute('{notallowed}'),
		'execute':(fragment, original) => navi.execute(fragment, { original })
	});

	let rights = new Backbone.Model();

	let Layout = Mn.View.extend({
		el:'body',
		template:_.noop,
		regions:{
			'content':'section'
		},
		events:{
			'click .toggle-rights'(){
				this.model.set('rights', !this.model.get('rights'));
			}
		},
		modelEvents:{
			'change:rights'(){
				let label = this.model.get('rights') ? 'clear rights' : 'get rights';
				$('.toggle-rights').html(label);
			}
		},
		showPage(page){
			this.page = page;
			view = new Mn.View({
				template: () => $(`#${page.getOption('templateId')}`).html()
			});
			this.showChildView('content', view)
		},
		emptyPage(){
			if(this.isRendered()){
				this.getRegion('content').empty();
			}
		},
		stopPage(){
			this.emptyPage();
			return this.page && this.page.stop() || Promise.resolve();			
		}
	});
	let layout = new Layout({ model: rights });

	let Preloader = Mn.View.extend({
		className: 'page-preloader',
		template:() => '<div>please wait, loading...</div>',
		onBeforeRender(){
			this.$el.appendTo($('body'));
		}
	})


	const BasePage = bbmn.components.Page.extend({
		relativeRoutes: true,
		onBeforeStart(){
			return prom(500);
		},
		onStart(){
			layout.showPage(this);
		},
		onEndStart(){ this.hidePreloader(); },
		onBeginStart(){ this.showPreloader(); },
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


	const AuthPage = BasePage.extend({
		canNotStart(){
			if(rights.get('rights') !== true)
				return 'not:allowed';
		}
	})

	const Root = BasePage.extend({
		routes:'root',
		relativeRoutes: false,
		shouldCreateRouter: true,
		templateId:'root',
		defaultChildClass: BasePage,		
		children:[
			{
				relativeRoutes:false,
				routes:'{notallowed}',
				templateId:'notallowed',
			},
			{
				relativeRoutes:false,
				routes:'{notallowed2}',
				templateId:'notallowed2',
			},			
			{
				relativeRoutes:false,
				routes:'{notfound}',
				templateId:'notfound',
			},
			BasePage.extend({
				relativeRoutes:false,
				routes:'{notfound2}',
				templateId:'notfound2',
			}),					
			{
				routes:'cats',
				templateId:'cats',
			},			
			{
				routes:'auth2',
				templateId:'auth2',
				canNotStart(){
					if(rights.get('rights') !== true)
						return ['execute','{notallowed2}'];
				},
			},
			{
				Child: AuthPage,
				routes:'auth',
				templateId:'auth',
			},			
			{
				routes:'fake-404',
				templateId:'notfound',
				canNotStart(){					
					return ['execute','{notfound2}'];
				},
			},
		]
	});


	let root = new Root();
	root.router.on('all', (c,a) => console.log('router:', c, a));

	rights.on('change:rights',() => root.router.restartLastAttempt());

	window.router = root.router;
	
	watcher.watch();
	bbmn.components.history.start();



});
