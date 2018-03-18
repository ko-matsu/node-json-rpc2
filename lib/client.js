const https = require('https');
const http = require('http');

function getRandomId() {
    return parseInt(Math.random() * 100000);
}

class Client {
	constructor(options) {
    options = options || {};
    this.authNeeded = false;
    this.protocol = options.protocol || 'http';//Either http or https
    this.user = options.user || undefined;
    this.password = options.password || undefined;
    this.host = options.host || '127.0.0.1';
    this.port = options.port || ((this.protocol === 'https') ? 8443 : 8080);
    this.agent = (this.protocol==='https')? https : http;
    this.method = options.method || "POST";
    this.path = options.path || '/';

    if(options && options.hasOwnProperty('user') && (options.hasOwnProperty('password') || options.hasOwnProperty('pass'))) {
	    this.authNeeded = true;
	    this.authData = options.user;
	    if (options.hasOwnProperty('password')) {
		    this.authData += ':' + options.password;
	    }
	    if (options.hasOwnProperty('pass')) {
		    this.password = options.pass;
		    this.authData += ':' + options.pass;
	    }
    }
	}

	callPromise(method = '', params = []) {
		return new Promise((resolve, reject) => {
			let requestData = {
				id: getRandomId(),
				method: method,
				params: params,
				jsonrpc: '2.0'
			};

			requestData = JSON.stringify(requestData);
			if (this.method === 'GET') {
				requestData = require('querystring').escape(requestData);
			}

			let requestOptions = {
				agent: this.agent.globalAgent,
				method: this.method,
				host: this.host,
				port: this.port,
				path: this.path,
				headers: {
					'content-type': (this.method === 'POST') ? 'application/x-www-form-urlencoded' : 'application/json',
					'content-length': (requestData).length
				}
			};

			if (this.authNeeded) {
				requestOptions.auth = this.authData;
			}
			if (this.method === 'GET') {
				requestOptions.path = requestOptions.path + requestData;
			}

			let request = this.agent.request(requestOptions);

			request.on('error', err => {
				reject(err);
			});

			request.on('response', res => {
				let data = '';

				res.on('data', bytes => {
					data += bytes;
				});

				res.on('end', () => {
					if (res.statusCode === 200 || res.statusCode === 304) {
						if (data.length > 0) {
							try {
								resolve(JSON.parse(data));
							} catch (err) {
								reject(data, res.statusCode);
							}
						}
					} else {
						reject(data, res.statusCode);
					}
				});
			});

			// Send request to server
			request.end(requestData);
		})
	}

	/**
	 * method : A String with the name of the method to be invoked.
	 * params : An Object or Array of values to be passed as parameters to the defined method.
	 * callback : A Function(error, success)
	 */
	call(method = '', params = [], callback) {
		let requestData = {
			id: getRandomId(),
			method: method,
			params: params,
			jsonrpc: '2.0'
		};

		requestData = JSON.stringify(requestData);

		if (this.method === 'GET') {
			requestData = require('querystring').escape(requestData);
		}

		let requestOptions = {
			agent: this.agent.globalAgent,
			method: this.method,
			host: this.host,
			port: this.port,
			path: this.path,
			headers: {
				'content-type': (this.method === 'POST') ? 'application/x-www-form-urlencoded' : 'application/json',
				'content-length': (requestData).length
			}
		};

		if (this.authNeeded) {
			requestOptions.auth = this.authData;
		}
		if (this.method === 'GET') {
			requestOptions.path = requestOptions.path + requestData;
		}

		let request = this.agent.request(requestOptions);

		request.on('error', error => {
			callback(error, undefined, undefined);
		});

		request.on('response', res => {
			let data = '';

			res.on('data', bytes => {
				data += bytes;
			});

			res.on('end', () => {
				if (res.statusCode === 200 || res.statusCode === 304) {
					if (data.length > 0) {
						try {
							callback(undefined, JSON.parse(data), res.statusCode);
						} catch (err) {
							callback(undefined, data, res.statusCode);
						}
					} else {
						callback(undefined, {}, res.statusCode);
					}
				} else {
					callback('Unable to connect to server', data, res.statusCode);
				}
			});
		});

		// Send request to server
		request.end(requestData);
	}
}

module.exports = Client;