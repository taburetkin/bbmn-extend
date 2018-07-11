
import '../../setup/node';
import result from '../../../src/utils/better-result';

describe('utils • better-result',function(){
	let testFunc = () => 'from function';
	let testContext = function(){ return this.name };
	let checkAlso = {
		name:'checkAlso',
		baz:'also baz',
		testContext
	}
	let obj = {
		name:'test',
		foo:'bar',
		bar: testFunc,
		testContext,
		argumentCount: (...args) => args.length,
		argumentValue: a => a
	}


	it('should return value by key in simple case',() => {
		expect(result(obj,'foo')).to.equal('bar')
	});

	it('should return function value',() => {
		expect(result(obj,'bar')).to.equal('from function')
	});

	it('should return function if force set to false',() => {
		expect(result(obj,'bar', {force: false})).to.equal(testFunc)
	});
	
	it('should return default value if set',() => {
		expect(result(obj,'barrrr', {default: 'default value'})).to.equal('default value')
	});	

	it('should check checkAlso if it set',() => {
		expect(result(obj,'baz', { checkAlso })).to.equal('also baz')
	});

	it('should apply object as context for function invocaion',() => {
		expect(result(obj,'testContext')).to.equal('test');
		expect(result(obj,'testContext', { checkAlso })).to.equal('test');
	});		

	it('should supply arguments for function invocaion',() => {
		expect(result(obj,'argumentCount',{args:['','','','']})).to.equal(4);
		expect(result(obj,'argumentValue',{args:['argument']})).to.equal('argument');
	});		

});
