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
