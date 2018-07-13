import '../../setup/node';
import compare from '../../../src/utils/comparator';
import Model from '../../../src/bb/model';
import { View } from 'backbone.marionette';


describe('utils • comparator',function(){
	let models = [
		new Model({id:1, order: 1, name: 'abc'}),
		new Model({id:2, order: 1, name: 'bcd'}),
		new Model({id:3, order: 0, name: 'aaa'})
	];

	it('should return 0 if no argument passed',() => {
		expect(compare()).to.equal(0);
	});

	it('should act like compareAB if there is a three arguments',() => {
		expect(compare(1,2)).to.equal(-1);
		expect(compare('abc','abc')).to.equal(0);
		expect(compare(-2, 2, function(){ return this * -1; })).to.equal(1);
	});

	it('should apply multiple comparators',() => {

		let compareBy = (a,b) => compare([
			[a,b, model => model.get('order')],
			[b,a, model => model.get('name')],
		]);
		let sorted = [].slice.call(models);
		sorted.sort(compareBy);
		
		expect(sorted[0]).to.equal(models[2]);
		expect(sorted[2]).to.equal(models[0]);
	});

	
});
