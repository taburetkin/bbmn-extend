import initProcess from '../../../components/process-engine/init';
export default Base => Base.extend({
	constructor(){
		Base.apply(this, arguments);
		initProcess(this, 'start');
		initProcess(this, 'stop');
	}
});