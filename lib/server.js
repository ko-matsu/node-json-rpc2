'use strict';
const http = require('http'),
      https = require('https'),
      querystring = require('querystring');

class Server {
	constructor(options) {
		options = options || {};
		this.authNeeded = false;
		this.protocol = options.protocol || 'http';//Http or https only for now
		this.user = options.user || null;
		this.password = options.password || null;
		this.port = options.port || ((this.protocol === 'https') ? 8443 : 8080);
		this.agent = (this.protocol === 'https') ? https : http;
		this.host = options.host || '127.0.0.1';
		this.method = options.method || 'POST';
		if (options && options.hasOwnProperty('user') && (options.hasOwnProperty('password') || options.hasOwnProperty('pass'))) {
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

		this.methods = {};

		this.server = this.agent.createServer((req, res) => {
			let data = '';

			req.on('data', (bytes) => {
				data += bytes;
			});

			req.on('end', () => {

				res.writeHead(200, {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
					'Connection': 'keep-alive',
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Credentials': 'true',
					'Access-Control-Allow-Headers': 'X-Requested-With'
				});

				let reply = {code: -32600, message: "Invalid Request"};
				try {
                    if (this.method === 'POST') {
                        data = (JSON).parse(data);
                    } else {
                        data = JSON.parse(Object.keys(querystring.parse(data))[0]);
                    }
                }catch(err){
					console.log(data,err);
				}

				if (data && data.method && data.params) {
					if (Object.keys(this.methods).indexOf(data.method) > -1) {
						let execMethod = this.methods[data.method];
						reply = execMethod(data.params, data.id);
					}else{
						reply = {code: -32601, message: "Method not found"}
					}
				}
				res.end(JSON.stringify(reply));
			});
		});

		this.server.listen(this.port, this.host);
	}

	addMethod(methodName, callback) {
		this.methods[methodName]=callback;
	}
}

module.exports = Server;
