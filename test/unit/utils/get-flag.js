import '../../setup/node';
import { getFlag } from '../../../src/utils';

describe('utils • get-flag',function(){
	describe('when check argument is not a string, array or object',function(){
		it('should return undefined',function(){
			expect(getFlag(5,2)).to.be.undefined;
			expect(getFlag(null,2)).to.be.undefined;
			expect(getFlag(undefined,2)).to.be.undefined;
		});
	});	
	describe('when check argument is a string',function(){
		describe('and flag argument is a string',function(){
			describe('and options are not set', function(){
				it('should return given flag value',function(){
					expect(getFlag('asd','asd')).to.be.equal('asd');
				});
				it('should return meet flag value as string',function(){
					expect(getFlag('asd','asd, qwe')).to.be.equal('asd');
				});
				it('should be case insensitive by default',function(){
					expect(getFlag('asd','Asd, qwe')).to.be.equal('asd');
					expect(getFlag('Asd','asd')).to.be.equal('Asd');
				});
			});
			describe('and there is an options', function(){
				it('should return founded value by given flag as string if returnAs options is set to "string"',function(){
					expect(getFlag('Asd','asd', { returnAs: 'string' })).to.be.eql('Asd');
				});

				it('should return given flag value as array if returnAs options is set to "array"',function(){
					expect(getFlag('asd','asd', { returnAs: 'array' })).to.be.eql(['asd']);
				});
				it('should return given flag value as key value object if returnAs options is set to "object"',function(){
					expect(getFlag('Asd','asd', { returnAs: 'object' })).to.be.eql({0:'Asd'});
				});				
				it('should return meet flag value as array if returnAs options is set to "array"',function(){
					expect(getFlag('asd,qwe,zxc','asd,zxc', { returnAs: 'array' })).to.be.eql(['asd','zxc']);
				});
				it('should return undefined if caseInsensitive options is set to false',function(){
					expect(getFlag('asd','Asd', { caseInsensitive: false })).to.be.equal('');
					expect(getFlag('Asd','asd', { caseInsensitive: false })).to.be.equal('');
				});				
			});
		});	
		describe('and flag argument is an array',function(){
			describe('and options are not set', function(){
				it('should return given flag value as array',function(){
					expect(getFlag('asd',['asd'])).to.be.eql(['asd']);
				});
				it('should return meet flag value as array',function(){
					expect(getFlag('asd',['asd', 'qwe'])).to.be.eql(['asd']);
				});
				it('should be case insensitive by default',function(){
					expect(getFlag('asd',['Asd', 'qwe'])).to.be.eql(['asd']);
					expect(getFlag('Asd',['asd'])).to.be.eql(['Asd']);
				});
			});
			describe('and there is an options', function(){
				
				it('should return founded values by given flag as array if returnAs options is set to "array"',function(){
					expect(getFlag('Asd',['asd'], { returnAs: 'array' })).to.be.eql(['Asd']);
				});
				it('should return empty array if returnAs options is set to "array"',function(){
					expect(getFlag('Asd',['qwe'], { returnAs: 'array' })).to.be.eql([]);
				});

				it('should return founded values by given flag as string if returnAs options is set to "string"',function(){
					expect(getFlag('Asd',['asd'], { returnAs: 'string' })).to.be.eql('Asd');
				});
				it('should return empty string if returnAs options is set to "string"',function(){
					expect(getFlag('Asd',['qwe'], { returnAs: 'string' })).to.be.eql('');
				});

				it('should return founded values by given flag as object if returnAs options is set to "object"',function(){
					expect(getFlag('Asd',['asd'], { returnAs: 'object' })).to.be.eql({0:'Asd'});
				});
				it('should return empty object if returnAs options is set to "object"',function(){
					expect(getFlag('Asd',['qwe'], { returnAs: 'object' })).to.be.eql({});
				});

			});
		});				
	});	
	describe('when check argument is an array', function(){
		it('should return string value if flag is string', function(){
			expect(getFlag(['asd','Qwe','zxc'], 'qwe')).to.be.equal('Qwe');
		});
	});
	describe.only('when check argument is an object', function(){
		const check = {
			one: 'uno',
			Two: 'duos',
			three: 'Tres'
		}
		it('should return string value if flag is string', function(){
			expect(getFlag(check, 'two ,three')).to.be.equal('duos, Tres');
		});
		it('should return array of values if returnAs is set to array', function(){
			expect(getFlag(check, 'two ,three', { returnAs: 'array'})).to.be.eql(['duos', 'Tres']);
		});
		it('should return array of keys if returnAs is set to array and useObjectValues is false', function(){
			expect(getFlag(check, 'duos ,tres', { returnAs:'array', useObjectValues: true })).to.be.eql(['Two', 'three']);
		});

	});	
});
