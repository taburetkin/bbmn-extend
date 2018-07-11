import '../../setup/node';
import isKnownCtor from '../../../src/utils/is-known-ctor';
import ctors from '../../../src/utils/is-known-ctor/ctors';
import Model from '../../../src/bb/model';

describe('utils • is-known-ctor',function(){
	it('should return false if an argument is not one of known constructors',() => 
		expect(isKnownCtor(function(){})).to.equal(false)
	);
	it('should return true if an argument is one of known constructors',() => {
		expect(isKnownCtor(Model)).to.equal(true)
	});	
	it('should return true if an argument is a custom constructor',() => {
		let NewCtor = function(){};
		ctors.push(NewCtor);
		expect(isKnownCtor(NewCtor)).to.equal(true)
	});
});