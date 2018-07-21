import Process from '../../../components/process';
export default Base => Base.extend({
	constructor(){
		Base.apply(this, arguments);

		Process.register(this, 'start');
		Process.register(this, 'stop');

	}
});
