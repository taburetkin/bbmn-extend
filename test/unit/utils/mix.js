import mix from '../../../src/utils/mix';
import extend from '../../../src/utils/extend';

describe('utils • mix',function(){
	describe('	mix itself', () => {
		it('should expose with', () => {
			let test = mix({});
			expect(test.with).to.be.a('function');
		});
		it('should expose class', () => {
			let test = mix({});
			expect(test.class).to.be.a('function');
		});
		it('should expose options', () => {
			let test = mix({},{foo:'foo'});
			expect(test.options).to.be.an('object');
			expect(test.options.foo).to.be.equal('foo');
		});		
		it('class should be a base class', () => {
			let base = function(){};
			let test = mix(base);
			expect(test.class).to.be.equal(base);
		});
		it('class should extend base class with static extend method', () => {
			let base = function(){};
			let test = mix(base);
			expect(test.class.extend).to.be.equal(extend);
		});

	});
	describe('	with', () => {
		let MyClass = function(){};
		MyClass.prototype.qwerty = 'qwerty';
		MyClass.staticA = 'staticA';

		let A = { foo: 'foo', constructor(){ this._A = 'settled' } };
		let B = { bar: 'bar', constructor(){ this._B = 'settled' } };
		let C = { foo: 'baz', baz: 'baz' };
		let D = Base => Base.extend({
			constructor(){ 
				Base.apply(this, arguments);
				this._D = 'settled' 
			},
			mixedA: 'mixedA'
		}, { staticB: 'staticB' });

		it('should mix plain object', () => {
			let Test = mix({}).with(A);
			let test = new Test();
			expect(test.foo).to.be.equal('foo');
		});

		it('should mix mixin', () => {
			let Test = mix({}).with(D);
			let test = new Test();
			expect(test.mixedA).to.be.equal('mixedA');
		});

		it('should keep static fields', () => {
			let Test = mix(MyClass).with(D);			
			expect(Test.staticA).to.be.equal('staticA');
			expect(Test.staticB).to.be.equal('staticB');
		});
		
		it('should mix with bundle mixins', () => {
			let Test = mix(MyClass).with(A, B, C, D);
			let test = new Test();
			expect(test.foo).to.be.equal('baz');
			expect(test.bar).to.be.equal('bar');
			expect(test.baz).to.be.equal('baz');
			expect(test.mixedA).to.be.equal('mixedA');
			expect(test._A).to.be.equal('settled');
			expect(test._B).to.be.equal('settled');
			expect(test._D).to.be.equal('settled');			
		});

		it('should mix with one merged mixin', () => {
			let Wrap = mix({}, { wrapObjectWithConstructor: false });
			let Test = Wrap.with(A, B, C);
			let test = new Test();
			expect(test._A).to.be.equal(undefined);
			expect(test._B).to.be.equal('settled');
		});

	});
});
