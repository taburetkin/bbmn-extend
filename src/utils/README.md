# utils
## contents: 
* [utils/better-result](#utilsbetter-result)
* [utils/camel-case](#utilscamel-case)
* [utils/comparator](#utilscomparator)
* [utils/compare-ab](#utilscompare-ab)
* [utils/flat](#utilsflat)
* [utils/get-by-path](#utilsget-by-path)
* [utils/is-known-ctor](#utilsis-known-ctor)
* [utils/mix](#utilsmix)
* [utils/set-by-path](#utilsset-by-path)
* [utils/unflat](#utilsunflat)

-----

## utils/better-result
Acts almost as underscore [`_.result`](https://underscorejs.org/#result) but can invoke result function if its not one of well known constructors.  
> note:  
third argument is NOT a default value. default value should be passed through options.

This function was implemented for better expirience with `backbone` and `backbone.marionette` instances. It helps handle complex options which can be a function and helps getting not yet initialized options values. see examples.

### returns: 
value of context's property
### arguments:
* **context**: object, required
* **key**: string, required  
* **options**: object, optional  

### options:
* **force**: boolean, default: true 
	> if **true** and returned **value is function** and it is not on e of well known constructor will return result of this function. if **false** will return value **as is**
* **default**: any, default: not set
	> if returned value is null or undefined will return default instead.
* **context**: object, default: argument context
	> when result value is function this option will be used as context for calling value function.
* **args**: Array, default: not set
	> when result value is function this array will be passed to it as arguments
* **checkAlso**: object, default: not set	
	> when result value is null or undefined will check for same key in this object. 

### examples:
````javascript

const context = {
	foo:'foo',
	bar: (add) => 'bar + ' + (add || ''),
	View: Marionette.View
}

const checkAlso = {
	baz: (add) => 'ZZZ + ' + (add || '')
}

betterResult(context, 'foo');
// returns: "foo"
// like _.result(context, 'foo');

betterResult(context, 'baz', { default: 'default baz'});
// returns: "default baz"
// like _.result(context, 'foo', "default baz");

betterResult(context, 'bar');
// returns: "bar + "
// _.result will return func(add) => 'bar + ' + (add || '')

betterResult(context, 'View');
// returns: Marionette.View
// like _.result(context, 'View')

betterResult(context, 'bar', { force: false });
// returns: func(add) => 'bar + ' + (add || '')
// like _.result(context, 'bar')

betterResult(context, 'bar', { args:['add this']});
// returns: "bar + add this"

betterResult(context, 'baz', { args:['add this'], checkAlso });
// returns: "ZZZ + add this"

````

### usage in a backbone or marionette instance
There is a special mixin which utilizies this function and can be used for getting options or properties: [mixins/common/get-option](https://github.com/taburetkin/bbmn-extend/tree/master/src/mixins/common/get-option)

getting not initialized option:
````javascript
const View = Marionette.View.extend({
	constructor(options){

		// at this point options is not yet initialized, 
		// so you can not use getOption here, but you can do it like this
		let value1 = betterResult(options, 'optionsValue', { checkAlso: this})

		let value2 = betterResult(options, 'instanceValue', { checkAlso: this})

		// with get-option mixin you can just use this.getOption() 
		// for the same result. check mixin readme

		console.log(value1);
		console.log(value2);

		Marionette.View.apply(this, arguments);
		// at this ppoint options is initialized and getOption will work as intended
	},
	optionsValue: 'instace-foo',
	instanceValue: 'instance-bar'
});

new View({ optionsValue: 'options-foo' })
// console output:
// options-foo
// instance-bar


````

## utils/camel-case
converts `:` separated string to `camelCase`.
### returns: 
string
### arguments:
* **text**: string, required
* **affectFirstLetter**: boolean, optional  
	> if true will capitalize first letter

### usage:
````javascript

let result = camelCase('as:camel:case'); //  - "asCamelCase"
result = camelCase('as:camel:case', true); // - "AsCamelCase"

````

## utils/comparator
compares A and B.  
difference from `compare-ab` is that you can pass multiple sets of compare operators.

### returns: 
-1 | 0 | 1

### arguments:
accepts 3 arguments and acts like `compareAB`:
> comparator(A, B, getter | [getter, ..])

or array :
> comparator(array)  
[ [A, B, getter | [getter, ..]], ... ]

### examples:
````javascript

compare(view1, view2, model => model.get('order'));
//acts like compareAB

compare([
	[view2, view1, model => model.get('order')], // by order desc
	[view1, view2, model => model.get('name')], // then by name asc
]);


````

## utils/compare-ab
compares a and b  
was implemented for backbone.model or marionette.view comparison  
used by [utils/comparator](https://github.com/taburetkin/bbmn-extend/tree/master/src/utils/comparator)
### returns: 
-1 | 0 | 1
> -1 if `a` less then `b`,  
> 0 if `a` equals `b`  
> and 1 if `a` greater than `b`
### arguments:
* **a**: any, required
* **b**: any, required
* **getter**: function | [function, function, ...], optional  
	> argument skipped if it is not a function or an array of functions
	
### getter: `function`
should return value to be compared  
will be applied to each argument to extract compare value  
`this` is equal to given argument and also two arguments passed: `model` and `view`  
> getter(model, view)

### getter: `[function, function, ...]`
does multiple compare of `a` and `b` by given array of getters.  
if getter returns '0' then next getter applied.

### examples:
````javascript

compareAB(1,2); 
// returns: -1

compareAB({foo:2}, {foo:1}, function(){ return this.foo }); 
// returns: 1

let modelA = new Backbone.Model({id:5, order: 1});
let modelB = new Backbone.Model({id:5, order: 2});
compareAB(modelA, modelB, model => model.id); 
// returns: 0

let viewA = new Mn.View({ model: modelA });
viewA.order = 0;
let viewB = new Mn.View({ model: modelB });
viewB.order = 0;
compareAB(viewA, viewB, [(model,view) => view.order, model => model.get('order')]); 
// returns: -1


````

## utils/flat
> flat(obj)

Flattens given object
### returns: 
plain object
### arguments:
* **obj** : object, required

### examples
````javascript
	let testArr = [1,2,3];
	let test = {
		foo: {
			bar:{
				baz:'hello'
			},
			qwe: testArr
		}
	}
	let result = flat(test);

	//result value will be
	{
		"foo.bar.baz":"hello",
		"foo.qwe":[1,2,3]
	}

````

## utils/get-by-path
### returns: 
value from object by given path.

### arguments:
* **object**: object, required
* **path**: string, required  
	> dot separated: `"property"` or `"property.anotherProperty"`

### usage:
````javascript
let myObject = {
	property: {
		value: 'my value',
	}
};

let result = getByPath(myObject, 'property.value'); //  - "my value"
result = getByPath(myObject, 'foo.bar'); // - undefined

````

## utils/is-known-ctor
returns true if passed argument is a well known constructor.  
in general was implemented for [utils/better-result](https://github.com/taburetkin/bbmn-extend/tree/master/src/utils/better-result) and [mixins/common/get-option](https://github.com/taburetkin/bbmn-extend/tree/master/src/mixins/common/get-option) mixin.

### returns: 
`true` if a given argument is a well known constructor.  
`false` if its not.

### arguments:
accepts one argument of any type.

### well known constructor
There is an array of registered well known constructors.  
By default it contains all backbone classes and marionette object class. You can push needed classes in that array. see examples

### examples:
```js
import isKnownCtor from 'utils/is-known-ctor';
import { View } from 'backbone.marionette';

let result = isKnownCtor(View); // true
result = isKnownCtor(function(){}); // false

```
its possible to add your own classes to common array

```js
import isKnownCtor from 'utils/is-known-ctor';
import ctors from 'utils/is-known-ctor/ctors';

const MyClass = function() {
	//
}

ctors.push(MyClass);

let result = isKnownCtor(MyClass); // true

```


## utils/mix
helper for extending class or object with a given mixins.
### returns: 
returns wrapper object: `{ with, options, class}`.

### arguments:
* **arg**: class definition or plain object, required
* **options**: object, optional

### options:
* **mergeObjects**: true | false (default value is **true**)
	> if true, collect plain object mixins in one object and convert it to a single mixin.  
	> if false, convert every object to a separate mixin.
* **wrapObjectWithConstructor**: true | false (default value is **true**)
	> this option is ignored if `mergeObjects` is set to **false**
	> when this options is **true** forces to convert plain object with constructor function to a separate mixin  
	> otherwise it will be mixed
#### options example:
````javascript
let mixinA = { a:'a' };
let mixinB = { b:'b' };
let ctorC = function(){};
let mixinC = { c: 'c', constructor: ctorC };
let ctorD = function(){};
let mixinD = { d: 'd', constructor: ctorD };

let mixedByDefault = mix({}).with(mixinA, mixinB, mixinC, mixinD);
/*
this will create three mixins which will be applied to the base class in order

mixin1 = Base => Base.extend({
	a:'a',
	b:'b'
});

mixin2 = Base => Base.extend({
	constructor: ctorC,
	c: 'c'
});

mixin3 = Base => Base.extend({
	constructor: ctorD,
	d: 'd'
});

*/


let mixedWithNoWrap = mix({}, {wrapObjectWithConstructor: false}).with(mixinA,mixinB,mixinC,mixinD);
/*
this will create one mixin which will be applied to the base class

mixin = Base => Base.extend({
	constructor: ctorD,
	a:'a',
	b:'b'
	c: 'c'
	d: 'd'
})

*/

let mixedWithNoMerge = mix({}, {mergeObjects: false}).with(mixinA,mixinB,mixinC,mixinD);
/*

this will create mixin for every argument will be applied to the base class in given order

*/

````

### usage:
````javascript
import mix from 'bbmn-extend/src/utils/mix';
import GetOptionMixin from 'bbmn-extend/src/mixins/common/get-option';
import Mn from 'backbone.marionette';

const MyFuncMixin = Base => Base.extend({
	myNewMethod() {
		// do something
	}
});

const MyPlainMixin = {
	constA: 'foo',
	constB: 'bar',
}

const MixedView = mix(Mn.View).with(GetOptionMixin, MyFuncMixin, MyPlainMixin);
let result = new MixedView();

````

## utils/set-by-path
sets object value by path
### returns: 
returns given value.

### arguments:
* **object**: object, required
* **path**: string, required (f.e. "property.anotherProperty")
* **value**: any, required
* **options**: object, optional

### options:
* **silent**: true | false, default is false
	> if true trigers appropriate `change` events on backbone.models
* **force**: true | false, default is true
	> if false do not set value if path does not exists,  
	> otherwise, create all needed objects

### usage:
````javascript

const test = {};
setByPath(test, 'foo.bar.baz', 'hello');
/* will create foo, bar and set baz equal to "hello" and returns "hello"
{ 
	foo: { 
		bar:{
			baz:"hello"
		} 
	} 
}
*/

const test2 = {};
setByPath(test2, 'foo.bar.baz', 'hello', {force: false});
// will not change test at all but returns "helo"
// test2 remains "{}"


setByPath(test, 'foo.bar.baz', 'bye', {force: false});
// because we already create this path in first example this will 
// change foo.bar.baz value from "hello" to "bye"

````

### what if i will use setByPath on backbone.model?
> setByPath changes model `attributes`
````javascript

let model = new Backbone.Model();
setByPath(model,'foo', 'bar');
// will set model attribute foo equal to 'bar'
// and triggers `change` and `change:foo` events

setByPath(model,'foo', 'bar', {silent: true});
// will set model attribute foo equal to 'bar'
// and do not trigger any events

let nested = new Backbone.Model();
model.set('nested', nested);

setByPath(model, 'nested.baz', 123);
// will set nested model baz attribute equal to 123 and
// triggers change events on both models

````

## utils/unflat
> unflat(obj)

Unflattens given object
### returns: 
plain object
### arguments:
* **obj** : object, required

### examples
````javascript
	let testArr = [1,2,3];
	let test = {
		"foo.bar.baz":"hello",
		"foo.qwe":[1,2,3]
	}
	let result = unflat(test);

	//result value will be
	{
		foo: {
			bar:{
				baz:'hello'
			},
			qwe: testArr
		}
	}	
	

````
