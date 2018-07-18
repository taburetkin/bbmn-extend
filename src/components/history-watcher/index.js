import { history }  from '../../bb/history';
import Events from '../../bb/events';

export default _.extend({
	watch(){
		this.entries = [];
		this.listenTo(history, 'route', this.onRoute);
		this.listenTo(history, 'backrouteroute', this.onBackRoute);
	},
	onRoute(){
		console.log('watcher:  route > ', ...arguments);
	},
	onBackRoute(){
		console.log('watcher: back route > ', ...arguments);
	},
}, Events);
