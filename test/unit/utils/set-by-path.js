import '../../setup/node';
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

	it('should trigger change event on model', function(){
		const stub1 = this.sinon.stub();
		const stub2 = this.sinon.stub();
		const stub3 = this.sinon.stub();
		let test = new Model();
		test.on('change', stub1);
		test.on('change:test', stub2);
		test.on('change:test:foo:bar', stub3);

		setByPath(test, 'test.foo.bar', 123);
		expect(stub1).to.have.been.calledOnce;
		expect(stub2).to.have.been.calledOnce;
		expect(stub3).to.have.been.calledOnce;
	});

	it('should trigger change event on nested model', function(){
		const stub1 = this.sinon.stub();
		const stub2 = this.sinon.stub();
		const stub3 = this.sinon.stub();

		let test = new Model();
		let hash = { test };
		test.on('change', stub1);
		test.on('change:foo', stub2);
		test.on('change:foo:bar', stub3);

		setByPath(hash, 'test.foo.bar', 123);
		expect(stub1).to.have.been.calledOnce;
		expect(stub2).to.have.been.calledOnce;
		expect(stub3).to.have.been.calledOnce;
	});	

	it('should trigger change event on all nested model', function(){
		const stub1 = this.sinon.stub();
		const stub2 = this.sinon.stub();
		const stub3 = this.sinon.stub();
		const stub4 = this.sinon.stub();
		const stub5 = this.sinon.stub();
		const stub6 = this.sinon.stub();

		let test = new Model();
		let shmest = new Model();		
		test.set('foo',{shmest});
		let hash = { test };

		test.on('change', stub1);
		test.on('change:foo', stub2);
		test.on('change:foo:shmest:bar:baz', stub3);

		shmest.on('change', stub4);
		shmest.on('change:bar', stub5);
		shmest.on('change:bar:baz', stub6);


		setByPath(hash, 'test.foo.shmest.bar.baz', 123);

		expect(stub1).to.have.been.calledOnce;
		expect(stub2).to.have.been.calledOnce;
		expect(stub3).to.have.been.calledOnce;
		expect(stub4).to.have.been.calledOnce;
		expect(stub5).to.have.been.calledOnce;
		expect(stub6).to.have.been.calledOnce;
	});	

});
