import '../../setup/node';
import camelCase from '../../../src/utils/camel-case';

describe('utils • camel-case',function(){
	describe('when passing one argument with optional last boolean', function(){

		it('should return undefined if there is no arguments',() => {
			expect(camelCase()).to.be.undefined;
		});

		it('should return given string value if it is not a string',() => {
			expect(camelCase(123)).to.equal('123');
		});
	
		it('should return empty string if argument is empty string',() => {
			expect(camelCase('')).to.equal('');
		});	
	
		it('should return asCamelCase',() => {
			expect(camelCase('as:camel:case')).to.equal('asCamelCase');
		});	
	
		it('should capitalize first letter if second argument is true',() => {
			expect(camelCase('as:camel:case', true)).to.equal('AsCamelCase');
		});	

	});
	describe.only('when passing multiple arguments with optional last bollean', function(){

		it('should return empty string if all arguments is empty and there is no last boolean',() => {
			expect(camelCase(undefined, null)).to.be.equal('');
		});
		it('should return empty string if all arguments is empty and there is last boolean specified',() => {
			expect(camelCase(undefined, null, true)).to.be.equal('');
		});
		it('should return joined string of not string parameters if there is last boolean not specified',() => {
			expect(camelCase(3, 2, 1)).to.be.equal('321');
		});		
		it('should return joined string of not string parameters if there is last boolean specified',() => {
			expect(camelCase(3, 2, 1, false)).to.be.equal('321');
		});
		it('should return joined camel cased string of parameters with small first letter if there is last boolean not specified',() => {
			expect(camelCase('as','camel','case')).to.be.equal('asCamelCase');
		});			
		it('should return joined camel cased string of parameters with capitalized first letter if there is last boolean is true',() => {
			expect(camelCase('as','camel','case', true)).to.be.equal('AsCamelCase');
		});			
		it('should return joined camel cased string of parameters with small first letter if there is last boolean is false',() => {
			expect(camelCase('as','camel','case', false)).to.be.equal('asCamelCase');
		});			
	});
});
