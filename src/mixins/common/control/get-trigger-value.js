export default function getTriggerValue(control, args = []){
	if (args.length) {
		return args[0];
	} else {
		return control.getControlValue();
	}
}
