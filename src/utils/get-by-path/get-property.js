import { isModel } from '../../vendors/helpers';
function getProperty(context, name)
{
	if(context == null || !_.isObject(context) || name == null || name == '') return;
	if (isModel(context))
		return context.get(name, { gettingByPath: true  });
	else
		return context[name];
}
export default getProperty;	
