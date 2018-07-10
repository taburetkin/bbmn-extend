# bbmn-extend
`mixins` and `utils` pack for backbone and backbone.marionette.

The main goal of this lib is to allow extend your `backbone` or `backbone.marionette` application with additional functionality.

## how to install
> **important:**
>
> this lib is not present on `npm` yet, so you should install it via github repo link

## how to use
just import needed things in your code

```js

import flat from 'node_modules/bbmn-extend/src/utils/flat'

let myObject = {
	foo: {
		bar: 'baz'
	}
}

let flatten = flat(myObject);



```



# utils 
## camelCase(text, affectFirstLetter) [utils/camel-case](https://github.com/taburetkin/bbmn-extend/tree/master/src/utils/came-case)
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

## compareAB(a,b,getter) [utils/compare-ab](https://github.com/taburetkin/bbmn-extend/tree/master/src/utils/compare-ab)
compares a and b  
was implemented for backbone.model or marionette.view comparison  
used by [utils/comparator](https://github.com/taburetkin/bbmn-extend/tree/master/src/utils/comparator)
### returns: 
-1 | 0 | 1
> -1 if a less then `b`,  
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

### usage:
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

## getByPath(object, path) [utils/get-by-path](https://github.com/taburetkin/bbmn-extend/tree/master/src/utils/get-by-path)
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

## isKnownCtor(argument) [utils/is-known-ctor](https://github.com/taburetkin/bbmn-extend/tree/master/src/utils/is-known-ctor)
returns true if passed argument is a well known constructor.  
in general was implemented for `getOption` mixin.

### returns: 
`true` if a given argument is a well known constructor.  
`false` if its not.

### arguments:
accepts one argument of any type.

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


## mix(arg, [options]) [utils/mix](https://github.com/taburetkin/bbmn-extend/tree/master/src/utils/mix)
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

## setByPath(object, path, value, [options]) [utils/set-by-path](https://github.com/taburetkin/bbmn-extend/tree/master/src/utils/set-by-path)
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
