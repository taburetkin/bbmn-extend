import '../../setup/node';
import compare from '../../../src/utils/compare-ab';
import { Model } from '../../../src/vendors/backbone.js';
import { View } from 'backbone.marionette';


describe('utils • compare-ab',function(){
	
	it('should return 0 if no argument passed',() => {
		expect(compare()).to.equal(0);
	});

	it('should return 0 if arguments equals',() => {
		expect(compare(1,1)).to.equal(0);
		expect(compare('abc','abc')).to.equal(0);
		expect(compare(2,2, function(){ return this; })).to.equal(0);
	});

	it('should compare by getter if its exists',() => {
		expect(compare({a:1},{a:0}, function() { return this.a * -1 })).to.equal(-1);
	});

	it('should pass model and view as arguments', () => {
		let a = new Model({id: 1, order: 1});
		let b = new Model({id: 2, order: 0});
		let v1 = new View({ model: a });
		v1.test = 2;
		let v2 = new View({ model: b });
		v2.test = 1;

		expect(compare(a,b, m => m.get('id'))).to.equal(-1);
		expect(compare(v1,v2, (m,v) => v.test)).to.equal(1);

	});

	it('should use multiple compare getters', () => {
		let a = new Model({id: 1, order: 1});
		let b = new Model({id: 2, order: 1});

		expect(compare(b,a, [m => m.get('order'), m => m.id])).to.equal(1);		
		expect(compare(a,b, [m => m.id, m => m.get('order')])).to.equal(-1);	
	});

	
});
