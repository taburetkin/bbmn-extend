import setByPath from '../../../src/utils/set-by-path';
import Model from '../../../src/bb/model';
describe('utils • set-by-path',function(){
	
	it('should return given value in any case',() => {
		expect(setByPath(null, 'path.path', 123)).to.equal(123);
		expect(setByPath({}, 'path.path', 321, {force:false})).to.equal(321);
		expect(setByPath({}, 'path.path', 777, {force:false})).to.equal(777);
	});

	it('should respect force:false option',() => {
		let test = {};
		setByPath(test, 'path.path', 123, {force:false});
		expect(test.path).to.equal(undefined);
	});

	it('should create objects by path',() => {
		let test = {};
		setByPath(test, 'path.path', 123);
		expect(test.path && test.path.path).to.equal(123);
	});

	it('should set model attributes instead ownproperties',() => {
		let test = new Model();
		setByPath(test, 'path.path', 123);
		expect(test.attributes.path && test.attributes.path.path).to.equal(123);
	});

	it('should also set nested model attributes',() => {
		let test = { path: new Model() };
		setByPath(test, 'path.path', 123);
		expect(test.path.attributes.path).to.equal(123);
	});


});
