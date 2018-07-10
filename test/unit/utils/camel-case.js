import camelCase from '../../../src/utils/camel-case';

describe('utils • camel-case',function(){
	
	it('should return given value if it is not a string',() => {
		expect(camelCase(123)).to.equal(123)
	});

	it('should return "" if argument is ""',() => {
		expect(camelCase('')).to.equal('')
	});	

	it('should return asCamelCase',() => {
		expect(camelCase('as:camel:case')).to.equal('asCamelCase')
	});	

	it('should capitalize first letter if second argument is true',() => {
		expect(camelCase('as:camel:case', true)).to.equal('AsCamelCase')
	});	
	
});
