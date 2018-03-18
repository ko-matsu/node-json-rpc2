// const RpcClient = require('node-json-rpc').Client;
const RpcClient = require('../lib/index').Client;
const RpcServer = require('../lib/index').Server;

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

console.log('Testing callback based call');

client.call(
    'add',
    [1, 2],
		(err, res) => {
    	console.log('Callback:');
	    if(err){
	        console.log(err);
	    }
	    console.log('Data:',res);
    }
);

console.log('Testing Promise based call');

client.callPromise('add', [1, 2]).then((data) => {
	console.log("Promise(Resolve):");
	console.log(data);
}).catch((err, status) => {
	console.log("Promise(Reject):");
	console.log(err);
});
