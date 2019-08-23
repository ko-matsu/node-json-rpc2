// const RpcClient = require('node-json-rpc').Client;
const { Server: RpcServer, Client: RpcClient} = require('../lib/index');

const server = new RpcServer({
    protocol: 'http',
    path: '/',
    port: 80,
    method: 'GET'
});

server.addMethod('add', (parameters, id) => {
    return {
    	id,
	    error: undefined,
	    result: parameters[0] + parameters[1]}
});

console.log(`Server running on ${server.host}:${server.port}`);

let client = new RpcClient({
	path: '/',
	port: 80,
	method: 'GET'
});

console.log('Testing Promise based call');

client.callPromise('add', [1, 2]).then((data) => {
	console.log("Promise(Resolve):");
	console.log(data);
}).catch((err, status) => {
	console.log("Promise(Reject):");
	console.log(err);
});
