const grpc = require('grpc');

const proto = grpc.load('proto/ServerSideExtension.proto');
const server = new grpc.Server();

const getCapabilities = (call, callback) => {
    var capabilities = {
        allowScript: true,
        pluginIdentifier: 'secSSE',
        pluginVersion: 'v0.0.1',
        functions: [{
            functionId: 0,
            name: 'HelloWorld',
            functionType: 2,
            returnType: 0,
            params: {
                name:'str1',
                dataType: 0
            }
        }]
    };

    callback(null,capabilities);
}

const executeFunction = (test) => {

}


//define the callable methods that correspond to the methods defined in the protofile
server.addProtoService(proto.qlik_sse.Connector.service, {
    GetCapabilities: getCapabilities,
    ExecuteFunction: executeFunction
});

//Specify the IP and and port to start the grpc Server, no SSL in test environment
server.bind('0.0.0.0:50050', grpc.ServerCredentials.createInsecure());

//Start the server
server.start();
console.log('grpc server running on port:', '0.0.0.0:50050');