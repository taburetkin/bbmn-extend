import initProcess from '../../../components/process-engine';
export default Base => Base.extend({
	constructor(){
		Base.apply(this, arguments);
		initProcess(this, 'start');
		initProcess(this, 'stop');
	}
});
