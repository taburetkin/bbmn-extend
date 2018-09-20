import compareAB from '../compare-ab/index.js';
export default function comparator(...args){
	var result = 0;

	//for simple case (arg1, arg2, compare)
	if (args.length <= 3 && !_.isArray(args[0])){

		return compareAB.apply(null, args);

	} 
	//for complex cases ([arg1, arg2, compare], [], .... [])
	//each arguments should be an array
	else {

		_(args).every((single) => {

			if(!_.isArray(single)) return true;
			result = compareAB(...single);
			return result === 0;
		});

	}

	return result;
}
