import { historyNavigate, executeHandler } from '../history';

function normalizeOptions(type = 'route', opts = {}){
	if(_.isObject(type)) {
		opts = type;
		type = 'route';
	} 
	return _.extend({ routeType: type, trigger: true }, opts);
}

export function execute(url, opts){
	return go(url, 'execute', opts);
}
export function navigate(url, opts){
	return go(url, 'route', opts);
}
export function navigateBack(url, opts){
	return go(url, 'backroute', opts);
}

export function go(url, type, opts)
{
	let options = normalizeOptions(type, opts);
	switch(options.routeType){
	default:
	case 'route':
	case 'backroute':
		return historyNavigate(url, options);
	case 'execute':
		return executeHandler(url, options);
	}

}
