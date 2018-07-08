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


