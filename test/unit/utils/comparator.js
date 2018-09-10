import '../../setup/node';
import { comparator } from '../../../src/utils/index.js';
import { Model } from '../../../src/vendors/backbone.js';



describe('utils • comparator',function(){
	let models = [
		new Model({id:1, order: 1, name: 'abc'}),
		new Model({id:2, order: 1, name: 'bcd'}),
		new Model({id:3, order: 0, name: 'aaa'})
	];

	it('should return 0 if no argument passed',() => {
		expect(comparator()).to.equal(0);
	});

	it('should act like compareAB if there is a three arguments',() => {
		expect(comparator(1,2)).to.equal(-1);
		expect(comparator('abc','abc')).to.equal(0);
		expect(comparator(-2, 2, function(){ return this * -1; })).to.equal(1);
	});

	it('should apply multiple comparators',() => {

		let compareBy = (a,b) => comparator([
			[a,b, model => model.get('order')],
			[b,a, model => model.get('name')],
		]);
		let sorted = [].slice.call(models);
		sorted.sort(compareBy);
		
		expect(sorted[0]).to.equal(models[2]);
		expect(sorted[2]).to.equal(models[0]);
	});

	
});
