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
## getByPath(object, path)
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

## isKnownCtor(argument)
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


## mix(arg, [options])
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
