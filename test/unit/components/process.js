
import '../../setup/node';
import Process from '../../../src/components/process';
import { Events } from 'backbone';
import mix from '../../../src/utils/mix';

describe('utils • better-result',function(){
	const Base = mix({
		constructor(opts = {}){
			this.cid = _.uniqueId('test');
			_(opts).each((value,key) => this[key] = value);
			this.initialize(opts);
		},
		initialize(){},
	}).with(Backbone.Events);
	
	beforeEach(() => {
		this.test = new Base({
			initialize(){				
				Process.register(this, 'proc', _.extend({}, this.opts));
			}
		});
	});


	it('should add trigger method to the context', () => {
		expect(this.test.proc).to.be.a('function');
	});


});
