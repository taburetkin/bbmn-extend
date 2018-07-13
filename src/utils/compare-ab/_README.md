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
