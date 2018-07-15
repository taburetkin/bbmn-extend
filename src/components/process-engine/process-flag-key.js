import camelCase from '../../utils/camel-case';

export default function executingProcessFlagKey(name){
	return camelCase(`_process:${name}:executing`);
}
