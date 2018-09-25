import '../../setup/node';
import { buildViewByKey, isView } from '../../../src/utils';
describe.only('utils • build-view-by-key',function(){

	describe('when key is not a string', function(){
		it('should return undefined', function(){
			expect(buildViewByKey()).to.be.undefined;
			expect(buildViewByKey(() => {})).to.be.undefined;
			expect(buildViewByKey([1,2])).to.be.undefined;
			expect(buildViewByKey({})).to.be.undefined;
			expect(buildViewByKey(1)).to.be.undefined;
		});
	});
	
	describe('when context has no property', function(){
		let context;
		beforeEach(function(){
			context = {
				options: {},
				buildViewByKey
			};
		});
		it('should return undefined', function(){
			
		});
	});



});