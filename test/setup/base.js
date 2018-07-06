import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiJq from 'chai-jq';

//var chai = require('chai');
// var sinon = require('sinon');
// var sinonChai = require('sinon-chai');
// var chaiJq = require('chai-jq');

chai.use(sinonChai);
chai.use(chaiJq);

global.chai = chai;
global.sinon = sinon;

if (!global.document || !global.window) {
	let jsdom = require('jsdom');
	const { JSDOM } = jsdom;
	global.window = new JSDOM('<html><head><script></script></head><body></body></html>', {
		FetchExternalResources: ['script'],
		ProcessExternalResources: ['script']
	});
	global.document = global.window.document;

	//global.window = document.defaultView;
	global.navigator = global.window.navigator;

}

// var setup = require('./setup.js');
// setup();
