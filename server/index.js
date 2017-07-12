const grpc = require('grpc');
var protobuf = require("protobufjs");
// load proto model to be able to decode header to determine function called
var builder=protobuf.loadProtoFile('proto/ServerSideExtension.proto');
var protoModel=builder.build("qlik.sse");

// load proto for grpc service
const proto = grpc.load('proto/ServerSideExtension.proto');
const server = new grpc.Server();

// send back capabilties to Qlik Sense 
const GetCapabilities = (call, callback) => {
    var capabilities = {
        allowScript: false,
        pluginIdentifier: 'secSSE',
        pluginVersion: 'v0.0.1',
        functions: [{
                functionId: 0,
                name: 'HelloWorld',
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

// function to route requests to right function
const ExecuteFunction = (call) => {
    var requestHeaders = call.metadata.getMap();
    var functionRequestHeader = requestHeaders['qlik-functionrequestheader-bin'];
    var commonRequestHeader = requestHeaders['qlik-commonrequestheader-bin'];

    var header=protoModel.FunctionRequestHeader.decode(functionRequestHeader);

    call.on('data', function (rowData) {
        // choose function based on header. 
        //Improvement to drive this from definition
        if(header.functionId==0) {
            rowData=helloWorld(rowData);
        } else if (header.functionId==1) {
            rowData=aesencryptData(rowData);
        } else if (header.functionId==2) {
            rowData=aesDecryptData(rowData);
        } else if (header.functionId==3) {
            rowData=fpeEncryptData(rowData);
        } else if (header.functionId==4) {
            rowData.fpeDecryptData(rowData);
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


const helloWorld = (rowData) => {
    for(count=0;  count < rowData.rows.length; count++) {
         rowData.rows[count].duals[0].strData = 'Hello World';
         rowData.rows[count].duals[0].numData = 1;
    }
    return rowData;
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