console.log('bbmn', bbmn);
$(() => {

	const Child = Mn.View.extend({
		template:() => 'child view'
	})

	const Test = bbmn.mixins.view.nestedViews(Mn.View).extend({
		template:() => '<div class="content-a"><div class="test-a"></div></div>',
		showAllNestedViewsOnRender: true,
		initialize(){
			this.$el.appendTo($('body'));
		},
		nestedViews:{
			viewA:{
				View:Child,
				region:{
					el:'.content-a .test-a'
				}
			},
			viewB:{
				View:Child,
				region:{
					el:'.content-b .test-b',
					updateDom: ($el) => $el.append('<section class="content-b"><div class="test-b"></div></div>'),
					replaceElement: true,
				}
			},
			viewC:{
				View:Child,
				region:{
					updateDom: true,
					replaceElement: true,
				}
			},			
		}
	});
	var test = new Test();
	test.render();
	console.log(test);


});
