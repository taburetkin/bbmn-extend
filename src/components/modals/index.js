import config from './config.js';

function show(opts = {}, showOptions = {}){

	let { preventRemove, promise } = opts;

	let modal = config.buildView(opts);
	showOptions.preventRemove = preventRemove;
	config.render(modal, config.getStack(), showOptions);

	if (promise) {
		return modal.promise;
	} else {
		return modal;
	}

}


export default {
	config,
	show
};
