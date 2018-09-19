import '../../setup/node';
import { hasFlag } from '../../../src/utils';

describe('utils • has-flag',function(){
	describe('when both is number',function(){
		const checkFive = 5;
		const againstZero = 0;
		const againstOne = 1;
		const againstTwo = 2;
		const againstThree = 3;
		const againstFour = 4;
		const againstFive = 5;

		it('should return true if `value & argument` greater than 0 and `all` option is not set', function(){
			expect(hasFlag(checkFive, againstOne)).to.be.true;
			expect(hasFlag(checkFive, againstFour)).to.be.true;
		});

		it('should return false if `value & argument` not equals argument and `all` option is true', function(){
			expect(hasFlag(checkFive, againstThree, { all: true })).to.be.false;
		});

		it('should return true if `value & argument` equals argument and `all` option is true', function(){
			expect(hasFlag(checkFive, againstFive, { all: true })).to.be.true;
		});

		it('should return false if argument bits is not inside checkvalue', function(){
			expect(hasFlag(checkFive, againstTwo)).to.be.false;
			expect(hasFlag(checkFive, againstZero)).to.be.false;
		});
	});
	describe('when one of arguments is number while other is not',function(){
		const num = 5;
		const text = '5';
		it('should return false', function(){
			expect(hasFlag(num, text)).to.be.false;
			expect(hasFlag(text, num)).to.be.false;
		});
	});
	describe('when both is strings',function(){
		
		it('should be case insensitive', function(){
			expect(hasFlag('AbC', 'abc')).to.be.true;
		});

		it('should return false if no values present in check', function(){
			expect(hasFlag('foo, bar', 'baz')).to.be.false;
		});


		it('should return true if some values present in check and `all` is not true', function(){
			expect(hasFlag('one, three, Four', 'five, four')).to.be.true;
		});

		it('should return false if some values present in check and `all` is true', function(){
			expect(hasFlag('one, three, four', 'five, four', { all: true })).to.be.false;
		});

	});
	describe('when flag is array',function(){
		
		it('should be case insensitive', function(){
			expect(hasFlag('AbC', ['abc'])).to.be.true;
		});

		it('should return false if no values present in check', function(){
			expect(hasFlag('foo, bar', ['baz'])).to.be.false;
		});


		it('should return true if some values present in check and `all` is not true', function(){
			expect(hasFlag('one, three, Four', ['five','four'])).to.be.true;
		});

		it('should return false if some values present in check and `all` is true', function(){
			expect(hasFlag('one, three, four', ['five', 'four'], { all: true })).to.be.false;
		});

	});
	describe('when check is object and useObjectValues is not true',function(){
		const check = {
			one: 'one',
			two: 'two',
			Three: 'Three',
			four: 'four',
		}
		it('should be case insensitive', function(){
			expect(hasFlag(check, 'three')).to.be.true;
		});

		it('should return false if no values present in check', function(){
			expect(hasFlag(check, ['baz'])).to.be.false;
		});


		it('should return true if some values present in check and `all` is not true', function(){
			expect(hasFlag(check, 'five,four')).to.be.true;
		});

		it('should return false if some values present in check and `all` is true', function(){
			expect(hasFlag(check, ['five', 'four'], { all: true })).to.be.false;
		});

	});
	describe('when check is object and useObjectValues is true',function(){
		const check = {
			_one: 'one',
			_two: 'two',
			_Three: 'Three',
			_four: 'four',
		}
		const options = { useObjectValues: true };
		it('should be case insensitive', function(){
			expect(hasFlag(check, 'three', options)).to.be.true;
		});

		it('should return false if no values present in check', function(){
			expect(hasFlag(check, ['baz'], options)).to.be.false;
		});


		it('should return true if some values present in check and `all` is not true', function(){
			expect(hasFlag(check, 'five,four', options)).to.be.true;
		});

		it('should return false if some values present in check and `all` is true', function(){
			expect(hasFlag(check, ['five', 'four'], _.extend({ all: true }, options))).to.be.false;
		});

	});		
});
