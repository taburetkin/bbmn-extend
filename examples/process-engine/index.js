
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
	
	const test = _.extend({
		canNotStart(){
			//return 'not:allowed';
		},
		getStartPromises(){
			return [prom(100), prom(200), prom(100), prom(200), prom(550)];
		},
	}, Backbone.Events);
	test.on('all', (...args) => console.log(...args));

	bbmn.components.processEngine(test, 'start', {
		concurrent: 'last' // false | 'last' | 'first' | undefined
	});

	test.start();
	setTimeout(() => test.start(), 300);



});
