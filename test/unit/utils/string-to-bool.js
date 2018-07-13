import cfg from '../../setup/node';
import bool from '../../../src/utils/to-bool';

describe('utils • string-to-bool', function(){

	describe('utils • string-to-bool: default', () => {
		it('should return undefined if passed arg is null and nullable option is not set to false',() => {
			expect(bool(null)).to.be.equal(undefined);
		});
		it('should return undefined if passed arg is undefined and nullable option is not set to false',() => {
			expect(bool(undefined)).to.be.equal(undefined);
		});
		it('should return empty string if passed arg is empty string and nullable option is not set to false',() => {
			expect(bool("")).to.be.equal(undefined);
		});	
		it('should return true for all true values by default', () => {
			let test = _(bool.trueValues).some(val => !bool(val));
			expect(test).to.be.equal(false);
		});
		it('should return false for all false values by default', () => {
			let test = _(bool.falseValues).some(val => bool(val));
			expect(test).to.be.equal(false);
		});	
		it('should return true for all not known values by default', () => {
			expect(bool('lkjasdlkajsd')).to.be.equal(true);
			expect(bool(2)).to.be.equal(true);
			expect(bool({})).to.be.equal(true);
			expect(bool(new Date())).to.be.equal(true);
			expect(bool(() => {})).to.be.equal(true);
		});
	});

	describe('utils • string-to-bool: not nullable', () => {

		let nbool = _.partial(bool, _, { nullable: false });
		let nsbool = _.partial(bool, _, { nullable: false, strict: true });
		it('should return false if passed arg is null, undefined or empty string and nullable option is set to false',() => {
			expect(nbool(null)).to.be.equal(false);
			expect(nbool(undefined)).to.be.equal(false);
			expect(nbool("")).to.be.equal(false);
		});

		it('should return false for all not known values if nullable option is set to false and strict set to true', () => {
			expect(nsbool('lkjasdlkajsd')).to.be.equal(false);
			expect(nsbool(2)).to.be.equal(false);
			expect(nsbool({})).to.be.equal(false);
			expect(nsbool(new Date())).to.be.equal(false);
			expect(nsbool(() => {})).to.be.equal(false);
		});		
	});

	describe('utils • string-to-bool: special options', () => {
		
		let nbool = _.partial(bool, _, { nullable: false });
		let nsbool = _.partial(bool, _, { nullable: true, strict: true });

		it('should return given returnNullAs value if it passed to options',() => {
			let nbool = _.partial(bool, _, { returnNullAs: true });
			
			expect(nbool(null)).to.be.equal(true);
			expect(nbool("")).to.be.equal(undefined);
			
		});

		it('should return given returnEmptyAs value if it passed to options',() => {
			let nbool = _.partial(bool, _, { returnEmptyAs: true });
			
			expect(nbool(null)).to.be.equal(undefined);
			expect(nbool("")).to.be.equal(true);
			
		});		

		it('should return given returnNullAndEmptyAs value if it passed to options',() => {
			let nbool = _.partial(bool, _, { returnNullAndEmptyAs: true });
			
			expect(nbool(null)).to.be.equal(true);
			expect(nbool("")).to.be.equal(true);
			
			
		});	

		it('should return given returnAnyAs value if it passed to options and argument is not empty',() => {
			let nbool = _.partial(bool, _, { returnAnyAs: true, returnNullAndEmptyAs: false });
			
			expect(nbool(null)).to.be.equal(false);
			expect(nbool("")).to.be.equal(false);
			expect(nbool("asdasdasd")).to.be.equal(true);
			expect(nbool("false")).to.be.equal(true);
			
		});	

		it('should return given returnOtherAs value if it passed to options and argument is not in known values',() => {
			let nbool = _.partial(bool, _, { returnOtherAs: false, returnNullAndEmptyAs: false });
			
			expect(nbool(null)).to.be.equal(false);
			expect(nbool("")).to.be.equal(false);
			expect(nbool("asdasdasd")).to.be.equal(false);
			expect(nbool("false")).to.be.equal(false);
			expect(nbool("true")).to.be.equal(true);
			
		});			

		it('should return undefined for all not known values if nullable option is set to true and strict set to true', () => {
			expect(nsbool('lkjasdlkajsd')).to.be.equal(undefined);
			expect(nsbool(2)).to.be.equal(undefined);
			expect(nsbool({})).to.be.equal(undefined);
			expect(nsbool(new Date())).to.be.equal(undefined);
			expect(nsbool(() => {})).to.be.equal(undefined);
		});	

	});	

});
