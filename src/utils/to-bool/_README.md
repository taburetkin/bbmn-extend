Tries to convert given value to boolean. 
> toBool(undefined) -> undefined  
toBool('false') -> false

### returns: 
true | false | undefined*
> returns `undefined` if `nullable` option is set to true
### arguments:
* **arg** : any, required
* **options** : object, optional

### options:
* **nullable** : boolean, default: true
	> returns `undefined` if given argument is can not be converted to boolean
* **strict**: boolean, default: false
	> if set to true, then any value that are not in known list is treated as unknown and converts to `false` or `undefined` based on `nullable` option
* **returnNullAs** : boolean, default: not set
	> if set return this value if given argument is null or undefined.
* **returnEmptyAs** : boolean, default: not set
	> if set return this value if given argument is an empty string.
* **returnNullAndEmptyAs** : boolean, default: not set
	> if set return this value if given argument is an empty string, undefined or null.
* **returnAnyAs** : boolean, default: not set
	> if set return this value if given argument is not an empty string, undefined or null.
* **returnOtherAs** : boolean, default: not set
	> if set return this value if given argument is not an empty string, undefined or null and not one of known values

### known values
by default there is a list of `known` values
* **true values** : `'true'`, `'1'`, `'-1'`, `'yes'`
* **false values** : `'false'`, `'0'`, `'no'`

### examples:
````javascript

toBool({}, {strict: true}) -> undefined
toBool({}, {strict: true, nullable: false}) -> false
toBool({}, {nullable: false}) -> true
toBool('yes') -> true
toBool('true') -> true
toBool('false') -> false
toBool('no') -> false
toBool(null,{returnNullAs: true}) -> true
toBool("",{returnEmptyAs: true}) -> true

````
