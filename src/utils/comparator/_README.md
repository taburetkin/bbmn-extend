compares A and B.  
difference from `compare-ab` is that you can pass multiple sets of compare operators.

### returns: 
-1 | 0 | 1

### arguments:
accepts 3 arguments and acts like `compareAB`:
> comparator(A, B, getter | [getter, ..])

or array :
> comparator(array)  
[ [A, B, getter | [getter, ..]], ... ]

### examples:
````javascript

compare(view1, view2, model => model.get('order'));
//acts like compareAB

compare([
	[view2, view1, model => model.get('order')], // by order desc
	[view1, view2, model => model.get('name')], // then by name asc
]);


````
