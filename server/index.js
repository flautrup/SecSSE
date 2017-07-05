const grpc = require('grpc');

const proto = grpc.load('proto/ServerSideExtension.proto');
const server = new grpc.Server();

const GetCapabilities = (call, callback) => {
    var capabilities = {
        allowScript: false,
        pluginIdentifier: 'secSSE',
        pluginVersion: 'v0.0.1',
        functions: [{
            functionId: 0,
            name: 'HelloWorld',
            functionType: 0,
            returnType: 0
        }]
    };

    callback(null,capabilities);
}

const ExecuteFunction = (call, callback) => {
    return "Test";
}

const EvaluateScript = (call, callback) => {
    return "Test";
}


const helloWorld = () => {
    return "helloWorld";
}


//define the callable methods that correspond to the methods defined in the protofile
server.addService(proto.qlik.sse.Connector.service, {
    getCapabilities: GetCapabilities,
    executeFunction: ExecuteFunction,
    evaluateScript: EvaluateScript
});

//Specify the IP and and port to start the grpc Server, no SSL in test environment
server.bind('0.0.0.0:50050', grpc.ServerCredentials.createInsecure());

//Start the server
server.start();
console.log('grpc server running on port:', '0.0.0.0:50050');