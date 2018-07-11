import '../../setup/node';
import getByPath from '../../../src/utils/get-by-path';

describe('utils • get-by-path',function(){
	
	it('should return undefined if context is not object',() => {
		expect(getByPath(null, 'path.path')).to.equal(undefined)
		expect(getByPath(undefined, 'path.path')).to.equal(undefined)
	});

	it('should return undefined if path is empty',() => {
		expect(getByPath({a:'a'}, '')).to.equal(undefined)
	});	

	it('should return undefined if path is not exists',() => {
		expect(getByPath({a:'a'}, 'path.path')).to.equal(undefined)
	});	
	
	it('should return value if path is exists',() => {
		expect(getByPath({foo:{bar:{baz:'test value'}}}, 'foo.bar.baz')).to.equal('test value')
	});	
});
