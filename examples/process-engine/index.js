console.log('bbmn', bbmn);
$(() => {
	const test = _.extend({
		canNotStart(){
			//return new Error('stop this');
		},
	}, Backbone.Events);
	test.on('all', c => console.log(c));
	bbmn.components.processEngine.initProcess(test, 'start', {
		concurent: 'last'
	});
	test.start();
	test.start();

});
