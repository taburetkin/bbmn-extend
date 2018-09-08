export default function getTriggerValue(control, args = []){

	let value = args.length ? args[0] : control.getControlValue();

	if(_.isFunction(control.convertValue))
		value = control.convertValue(value);
		
	return value;
}
