console.log('bbmn', bbmn);
$(() => {

	const Child = Mn.View.extend({
		template:_.template('child view: <%= cid %>'),
		templateContext(){
			return {cid: this.cid }
		}
	});

	let Input = bbmn.mixins.controls.input(Mn.View)

	const Test = bbmn.mixins.view.nestedViews(Mn.View).extend({
		template:() => '<div class="content-a"><div class="test-a"></div></div><div class="content-c"><div class="test-c"></div></div>',
		showAllNestedViewsOnRender: true,
		initialize(){
			this.$el.appendTo($('body'));
		},
		regions:{
			'testC':{el:'.content-c .test-c'}
		},
		nestedViews:{
			viewA:{
				View: Input,
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
	console.log(test);
	test.render();

});
