import '../../setup/node';
import flat from '../../../src/utils/flat';

describe('utils • flat',function(){
	let testArr = [1,2,3];
	let test = {
		foo: {
			bar:{
				baz:'hello'
			},
			qwe: testArr
		}
	}
	it('should return undefined if passed argument is null or not an object', () => {
		expect(flat(123)).to.be.equal(undefined);
		expect(flat(null)).to.be.equal(undefined);
	});

	it('should return flatten object', () => {
		
		let value = flat(test);
		expect(_.isObject(value)).to.be.equal(true);
		expect(_.size(value)).to.be.equal(2);
		expect('foo.bar.baz' in value).to.be.equal(true);
		expect(value['foo.bar.baz']).to.be.equal('hello');
		expect(value['foo.qwe']).to.be.equal(testArr);

	});

});
