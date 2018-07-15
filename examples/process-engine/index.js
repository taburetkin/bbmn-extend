
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
			//$.ajax('http://blablablanobloblo.com'),
			//return [$.ajax('http://blablablanobloblo.com'), prom(100), prom(150, 'oops'), prom(200), prom(100), prom(200), , prom(550)];
			return [prom(100), prom(200), prom(100), prom(200), , prom(550)];
		},
	}, Backbone.Events);
	test.on('all', (...args) => console.log(...args));

	bbmn.components.processEngine(test, 'start', {
		concurrent: 'first'
	});
	test.start();
	//test.start();
	setTimeout(() => test.start(), 300);

	// Promise.all([prom(100,'crap'), prom(200), prom(300, 'oops')]);

	// prom(100,'crap').then(() =>  prom(200).then(() => prom(300, 'oops')));

	// prom(100,'crap').then(() =>  prom(200)).then(() => prom(300, 'oops'));

	//test.start();

	// let promise = new Promise((a,b) => {
	// 	let p = null; //Promise.reject('qweqwe');
	// 	let z = Promise.reject('asd');
	// 	return Promise.all([p,z]).then(
	// 		() => {},
	// 		(...args) => { console.log(args) }
	// 	);
	// });

	// promise.catch(console.log);


	//test.start().catch(console.log);
	// .then(
	// 	(b, a) => console.log('resolved first', b, ...(a || [])),
	// 	(b, a) => console.log('rejected first', b, ...(a || [])),
	// );

	// test.start().then(
	// 	(b, a) => console.log('resolved second', b, ...(a || [])),
	// 	(b, a) => console.log('rejected second', b, ...(a || [])),
	// );


});
