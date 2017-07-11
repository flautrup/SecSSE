const grpc = require('grpc');
var protobuf = require("protobufjs");
var builder=protobuf.loadProtoFile('proto/ServerSideExtension.proto');
var model=builder.build("qlik.sse");

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
                functionType: proto.qlik.sse.FunctionType.TENSOR,
                returnType: proto.qlik.sse.DataType.STRING,
                params: [{
                    name: 'str1',
                    dataType: proto.qlik.sse.DataType.STRING
                }]
            },
            {
                functionId: 1,
                name: 'HelloWorld2',
                functionType: proto.qlik.sse.FunctionType.SCALAR,
                returnType: proto.qlik.sse.DataType.STRING,
                params: [{
                    name: 'str1',
                    dataType: proto.qlik.sse.DataType.STRING
                }]
            }
        ]
    };

    callback(null, capabilities);
}


const ExecuteFunction = (call) => {
    var requestHeaders = call.metadata.getMap();
    var functionRequestHeader = requestHeaders['qlik-functionrequestheader-bin'];
    var commonRequestHeader = requestHeaders['qlik-commonrequestheader-bin'];

    var header=model.FunctionRequestHeader.decode(functionRequestHeader);

    call.on('data', function (rowData) {
        for (count = 0; count++; count <= rowData.rows.length) {
            rowData.rows[0].duals[0].strData = 'Hello World';
            rowData.rows[0].duals[0].numData = 1;
        }
        call.write(rowData);
    });
    call.on('end', function () {
        call.end();
    });
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