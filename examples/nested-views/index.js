console.log('bbmn', bbmn);
$(() => {

	let Region = Mn.Region.extend({
		replaceElement:true,
	});

	const View = bbmn.mixins.view.nestedViews(Mn.View).extend({
		showAllNestedViewsOnRender: true,
		initialize(){
			this.on('destroy', () => console.log('dest:', this.cid, _.result(this, 'className')));
		}
	});

	const Child = Mn.View.extend({
		className(){ return this.cid },
		template:_.template('child view: <%= cid %>'),
		templateContext(){
			return {cid: this.cid }
		}
	});	

	const Test = View.extend({
		template:() => '<div class="content-a"><div class="test-a"></div></div><div class="content-c"><div class="test-c"></div></div>',
		showAllNestedViewsOnRender: true,
		initialize(){
			this.$el.appendTo($('body'));
		},
		regionClass: Region,
		regions:{
			'testC':{el:'.content-c .test-c'}
		},
		nestedViews:{
			viewA:{
				View: Child,
				region:{
					el:'.content-a .test-a'
				}
			},
			viewB:{
				View: Child,
			},
			viewC:{
				View:Child,
				region:{
					el:'.content-b .test-b',
					updateDom: ($el) => $el.append('<section class="content-b"><div class="test-b"></div></div>'),
					replaceElement: false,
				}
			},
			viewD:{
				View: Child,
				region: {
					replaceElement: false,
				}
			},			
			testC:{
				View: Child,				
			},				
		}
	});

	var test = new Test();
	test.render();	
	test.render();


	const Input = bbmn.mixins.controls.input(View).extend({
		template: false,
		className:'input',
	});

	const Range = View.extend({
		className:'range',
		nestedViews:{
			from: Input,
			to: Input,
		},
	});

	const Wrapper = View.extend({
		className:'wrapper',
		nestedViews:{
			first: Range,
			second: Range,
		},
		onBeforeRender(){
			this.$el.appendTo($('body'))
		},
	});

	var wrap = new Wrapper();
	wrap.render();
	wrap.render();
	wrap.render();

	console.log('*', wrap);
});
