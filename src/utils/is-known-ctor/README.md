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

