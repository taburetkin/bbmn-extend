
console.log('bbmn', bbmn);

function prom (delay, error) {
	let id = _.uniqueId('p');
	return new Promise((resolve,reject) => {
		setTimeout(() => {
			console.log('	' + (error ? '!' : '.'), id);
			if(error)
				reject(error);
			else
				resolve();
		}, delay);
	});
}


$(() => {

	// let tp = prom(0);
	// let bb = tp.then(() => prom(0).then(() => prom(0))).then(() => prom(0));
	// bb.then(
	// 	() => console.log('done'),
	// 	e => console.log('error', e)
	// );

	// return;

	const Process = bbmn.components.Process;

	const Test = bbmn.utils.mix({
		constructor(opts = {}){
			this.cid = _.uniqueId('test');
			Process.register(this, 'concurrent');
			Process.register(this, 'concurrentless', {
				concurrent: false
			});
			Process.register(this, 'concurrentLast', {
				concurrent: 'last'
			});
			Process.register(this, 'concurrentFirst', {
				concurrent: 'first'
			});

			_(opts).each((value,key) => this[key] = value);

			this.on('all', (e, ...args) => console.log(this.cid+':', e, ...args));
			this.initialize(opts);
		},
		initialize(){},
	}).with(Backbone.Events);
	
	const test1 = new Test({
		// initialize(){
		// 	//return [prom(100), prom(200), prom(100), prom(200), prom(550)];

		// }
	});
	

	//normal flow:
	// - begin:concurrent
	// - before:concurrent
	// - concurrent
	// - end:concurrent
	// test1.concurrent('foo','bar');
	


	// hooks example
	let test2 = new Test({
		onBeginConcurrent(){
			console.log('	hook: begin concurrent');
		},
		onBeforeConcurrent(){
			console.log('	hook: before concurrent');
		},
		onConcurrent(){
			console.log('	hook: concurrent success');
		},
		onEndConcurrent(){
			console.log('	hook: concurrent end');
		},

	});
	//test2.concurrent();

	//setTimeout(() => test.start(), 300);

	// abort examples;
	let test3 = new Test({
		onBeginConcurrent(){

			// will ends process with 'stop before begin' in errors array;
			// also triggers 'begin:', 'error:' and 'end:' hooks
			//return 'stop before begin'; 

			// will throw this error and ends process with Error in errors array
			// do not trigger 'begin:' hook
			// but triggers 'error:' and 'end:' hooks
			//throw new Error('ooops');

			// will ends process with 'qwerty' in errors array
			// triggers 'begin:', 'error:' and 'end:' hooks
			//return Promise.reject('qwerty');


			// will throw this error and ends process with Error in errors array
			// triggers 'begin:', 'error:' and 'end:' hooks
			//return Promise.reject(new Error('foo'));

			// will throw ajax xhr error and ends process with xhr in errors array
			// triggers 'begin:', 'error:' and 'end:' hooks
			//return $.get('blablabla');
		},
		onBeforeConcurrent(){

			// will ends process with 'stop before begin' in errors array;
			// also triggers 'begin:', 'before:', error:' and 'end:' hooks
			//return 'stop before begin'; 

			// will throw this error and ends process with Error in errors array
			// do not trigger 'before:' hook
			// but triggers 'begin:', error:' and 'end:' hooks
			//throw new Error('ooops');

			// will ends process with 'qwerty' in errors array
			// also triggers 'begin:', 'before:', error:' and 'end:' hooks
			//return Promise.reject('qwerty');


			// will throw this error and ends process with Error in errors array
			// also triggers 'begin:', 'before:', error:' and 'end:' hooks
			//return Promise.reject(new Error('foo'));

			// will throw ajax xhr error and ends process with xhr in errors array
			// also triggers 'begin:', 'before:', error:' and 'end:' hooks
			//return $.get('blablabla');

		},
		canNotConcurrent(){
			
			// will ends process with 'stop before begin' in errors array;
			// also triggers 'begin:', 'before:', error:' and 'end:' hooks
			//return 'stop before begin'; 

			// will throw this error and ends process with Error in errors array
			// also triggers 'begin:', 'before:', error:' and 'end:' hooks
			//throw new Error('ooops');

			// will ends process with 'qwerty' in errors array
			// also triggers 'begin:', 'before:', error:' and 'end:' hooks
			//return Promise.reject('qwerty');


			// will throw this error and ends process with Error in errors array
			// also triggers 'begin:', 'before:', error:' and 'end:' hooks
			//return Promise.reject(new Error('foo'));

			// will throw ajax xhr error and ends process with xhr in errors array
			// also triggers 'begin:', 'before:', error:' and 'end:' hooks
			//return $.get('blablabla');

		},
	});
	//test3.concurrent();


	let test4 = new Test({
		initialize(){
			this.off('all');
		},
		onConcurrent(p){
			console.log('process completes:', p.cid);
		},
		onBeforeConcurrentless(){
			return prom(100, new Error('oops'));
		},
		onConcurrentless(p){
			console.log('process completes:', p.cid);
		},
		onErrorConcurrentless(p){
			console.log('process failed:', p.cid, p.errors);
		},
		onConcurrentFirst(p){
			console.log('process completes:', p.cid);
		},		
		onErrorConcurrentFirst(p){
			console.log('process failed:', p.cid, p.errors);
		},
		onConcurrentLast(p){
			console.log('process completes:', p.cid);
		},		
		onErrorConcurrentLast(p){
			console.log('process failed:', p.cid, p.errors);
		},

	});
	
	// two concurrentProcesses
	// test4.concurrent();
	// test4.concurrent();

	// trying to start two nonconcurrent processes	
	 test4.concurrentless();
	// test4.concurrentless();


	// concurrent last
	// will not initiate new process if one is already in progress, returns running process;
	// do not throw any errors for last processes
	// test4.concurrentLast();
	// test4.concurrentLast();



});
