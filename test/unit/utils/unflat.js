import '../../setup/node';
import unflat from '../../../src/utils/unflat';
import flat from '../../../src/utils/flat';

describe('utils • unflat',function(){
	let testArr = [1,2,3];
	let test = {
		"foo.bar.baz": "hello",
		"foo.qwe": testArr
	}
	



	it('should return undefined if passed argument is null or not an object', () => {
		expect(unflat(123)).to.be.equal(undefined);
		expect(unflat(null)).to.be.equal(undefined);
	});

	it('should return unflatten object', () => {
		
		let value = unflat(test);
		expect(_.isObject(value)).to.be.equal(true);
		expect(_.size(value)).to.be.equal(1);
		expect(value.foo.bar.baz).to.be.equal('hello');
		expect(value.foo.qwe).to.be.equal(testArr);

	});


});
