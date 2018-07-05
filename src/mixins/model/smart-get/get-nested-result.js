export default function getNestedResult(value, context, schema) {
	return value != null 
		&& _.isFunction(schema.nested) 
		&& schema.nested(value, context);
}