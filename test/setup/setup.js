module.exports = function(){

	var _ = require('underscore');
	var Backbone = require('backbone');
	var jQuery = require('jquery');
	jQuery = 'default' in jQuery ? jQuery.default : jQuery;
	Backbone.$ = jQuery;
	Backbone.Radio = require('backbone.radio');
	var Mn = require('backbone.marionette');
	Mn = 'default' in Mn ? Mn.default : Mn;

	global.$ = global.jQuery = jQuery;
	global._ = _;
	global.Backbone = Backbone;
	global.Mn = Backbone.Marionette = Mn;
	global.expect = global.chai.expect;
	
	var $fixtures;

	function setFixtures() {
		_.each(arguments, function(content) {
			$fixtures.append(content);
		});
	}

	function clearFixtures() {
		$fixtures.empty();
	}

	before(function() {
		$fixtures = $('<div id="fixtures">');
		$('body').append($fixtures);
		this.setFixtures = setFixtures;
		this.clearFixtures = clearFixtures;
	});

	beforeEach(function() {
		this.sinon = global.sinon.sandbox.create();
	});

	afterEach(function() {
		this.sinon.restore();
		window.location.hash = '';
		Backbone.history.stop();
		Backbone.history.handlers.length = 0;
		clearFixtures();
	});

}
