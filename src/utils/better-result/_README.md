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
