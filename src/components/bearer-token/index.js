import Model from '../../bb/model';
import Backbone from 'backbone';

let nativeAjax = Backbone.ajax;

const tokenizedAjax = function(...args){
	let options;

	if(args && args.length == 1 && _.isObject(args[0])){
		options = args[0];
	}
	if(args && args.length == 2 && !_.isObject(args[0]) && _.isObject(args[1])){
		options = args[1];
	}

	options && (options.headers = _.extend({}, options.headers, this.getAjaxHeaders()));

	return nativeAjax.apply($, args);
};


const Token = Model.extend({

	tokenAttribute: 'access_token',
	refreshTokenAttribute: 'refresh_token',
	endPoint: 'auth/token',
	secondsOffset: 30,

	shouldRequestOnInitialize: true,

	constructor(){
		this.ajaxHeaders = {};
		this.flows = {};
		this.initializeFlows();
		this.setExpiration(null);

		Model.apply(this, arguments);

		if (this.shouldRequestOnInitialize) {
			this.getReady();
		}
	},

	getReady(){
		if(this.ready) return this.ready;
		
		if (!this.hasToken()) {
			this.ready = Promise.resolve();
		} else {
			this.ready = this.refresh({force: true}).catch(() => {
				this.update(null);
			});
		}

		return this.ready;
	},
	

	initializeFlows(){

		this.setFlow('password', {
			url: this.endPoint,
			method: 'POST'
		});
		this.setFlow('refresh', {
			url: this.endPoint,
			method: 'POST'
		});

	},
	getFlow(key){
		return _.clone(this.flows[key] || {});
	},
	setFlow(key, value){
		this.flows[key] = value;
	},



	hasToken(){
		return this.getToken() != null;
	},
	getToken(){
		return this.get(this.tokenAttribute);
	},

	getRefreshToken(){
		return this.get(this.refreshTokenAttribute);
	},

	getAjaxHeaders(){		
		return this.ajaxHeaders;
	},	

	parse(data){
		return data;
	},

	fetch(options){
		if(this._fetching) return this._fetching;
		this._fetching = new Promise((resolve) => {
			nativeAjax(options).then(
				(json) => {

					let parsed = this.parse(_.clone(json));
					this.update(parsed);
					delete this._fetching;
					return resolve(json);
				}, 
				(xhr) => {

					delete this._fetching;
					this.update(null);
					return resolve(xhr);

				});	
		});
		return this._fetching;
	},
	update(hash, opts = {}){
		let { silent } = opts;
		if (hash == null) {

			this.clear(opts);

		} else {
			let fullhash = _.extend({}, this.attributes, hash);
			let unset = [];
			let shouldUnset = !!opts.unset;
			let setHash = _(fullhash).reduce((memo, value, key) => {
				if (key in hash) {
					memo[key] = value;
				} else if (shouldUnset) {
					unset.push(key);
				} else {
					memo[key] = undefined;
				}
				return memo;
			}, {});
			this.set(setHash, { silent });
			_(unset).each(key => this.unset(key, { silent }));
		}

		this.reflectTokenChanges();

	},

	replaceBackboneAjax(){		
		if(!this.hasToken())
			Backbone.ajax = nativeAjax;
		else
			Backbone.ajax = (...args) => this.ajax(...args);
	},
	updateAjaxHeaders(token){
		token || (token = this.getToken());
		let headers = this.getAjaxHeaders();
		if (token) {
			headers.Authorization = 'Bearer ' + token;
			headers.Accept = 'application/json';
		} else {
			delete headers.Authorization;
		}
	},

	//implement by your own
	storeToken(){},

	reflectTokenChanges(){
		this.updateAjaxHeaders();
		this.replaceBackboneAjax();
		this.storeToken();
		this.trigger('changed');
	},

	ajax(...args){
		return this.refresh().then(
			() => tokenizedAjax.apply(this, args),
			error => Promise.reject(error)
		);
	},	
	refresh(opts = {}){		

		// if token is fresh enough and there is no force refresh
		// pass
		if (!this.isExpired() && !opts.force) {
			return Promise.resolve();
		}
		let options = this.getFlow('refresh');
		options.data = this.getRefreshTokenData();
		return this.fetch(options);
	},
	getRefreshTokenData(){
		return {
			'grant_type':'refresh_token',
			'refresh_token': this.getRefreshToken(),
		};
	},

	setExpiration(arg){

		if (arg === null) {
			this.expiresAt = null;
		}

		let date;
		let now = new Date();

		if (_.isDate(arg)) {
			date = arg;
		} else if(_.isObject(arg)) {
			date = new Date();
			
			let { seconds, minutes, hours, days } = arg;
			date.setDate(date.getDate() + (days || 0));
			date.setHours(date.getHours() + (hours || 0));
			date.setMinutes(date.getMinutes() + (minutes || 0));
			date.setSeconds(date.getSeconds() + (seconds || 0));
		}

		if(!_.isDate(date) || isNaN(date.valueOf()) || date < now) {
			date = new Date();
			date.setSeconds(now.getSeconds() + 90);
		}

		this.expiresAt = date;
	},
	getExpiration(){
		return this.expiresAt;
	},
	isExpired(){
		let date = this.getExpiration();
		if(!_.isDate(date) || isNaN(date.valueOf()))
			return true;
		return date.valueOf() < Date.now() + (this.secondsOffset * 1000);
	},
	login(username, password){

		let options = this.getFlow('password');
		options.data = { grant_type:'password', username, password };
		return this.fetch(options);

	},

});

Token.setNativeAjax = function(arg){
	let old = nativeAjax;
	nativeAjax = arg;
	return old;
};

export default Token;
