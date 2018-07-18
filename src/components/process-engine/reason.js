import mix from '../../utils/mix';

const ProcessRejectReason = mix({
	constructor(type, message){
		this.type = type;
		this.message = message;
	},
	type:'common',
	message: undefined
});

export default ProcessRejectReason;
