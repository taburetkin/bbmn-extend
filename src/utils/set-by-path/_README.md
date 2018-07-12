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
