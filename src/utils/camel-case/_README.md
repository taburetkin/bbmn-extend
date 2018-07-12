converts `:` separated string to `camelCase`.
### returns: 
string
### arguments:
* **text**: string, required
* **affectFirstLetter**: boolean, optional  
	> if true will capitalize first letter

### usage:
````javascript

let result = camelCase('as:camel:case'); //  - "asCamelCase"
result = camelCase('as:camel:case', true); // - "AsCamelCase"

````
