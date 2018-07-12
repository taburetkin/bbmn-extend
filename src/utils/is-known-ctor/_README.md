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

