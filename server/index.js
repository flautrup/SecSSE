//Load modules
const grpc = require('grpc');
const protobuf = require("protobufjs");
const crypto = require('crypto');
const fpeCrypto = require('node-fpe')

// load proto model to be able to decode header to determine function called
var builder = protobuf.loadProtoFile('proto/ServerSideExtension.proto');
var protoModel = builder.build("qlik.sse");

// load proto for grpc service
const proto = grpc.load('proto/ServerSideExtension.proto');
const server = new grpc.Server();

//Config encryption (Key should be exchanged)
const config = {
    algorithm: 'aes256',
    key: 'Qlik',
    domain: ['0','1','2','3','4','5','6','7','8','9']
}

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
            },
            {
                functionId: 1,
                name: 'AESEncryptData',
                functionType: proto.qlik.sse.FunctionType.SCALAR,
                returnType: proto.qlik.sse.DataType.STRING,
                params: [{
                    name: 'str1',
                    dataType: proto.qlik.sse.DataType.STRING
                }]
            },
            {
                functionId: 2,
                name: 'AESDecryptData',
                functionType: proto.qlik.sse.FunctionType.SCALAR,
                returnType: proto.qlik.sse.DataType.STRING,
                params: [{
                    name: 'str1',
                    dataType: proto.qlik.sse.DataType.STRING
                }]
            },
            {
                functionId: 3,
                name: 'FPEEncryptData',
                functionType: proto.qlik.sse.FunctionType.SCALAR,
                returnType: proto.qlik.sse.DataType.STRING,
                params: [{
                    name: 'str1',
                    dataType: proto.qlik.sse.DataType.STRING
                }]
            },
            {
                functionId: 4,
                name: 'FPEDecryptData',
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

    var header = protoModel.FunctionRequestHeader.decode(functionRequestHeader);

    call.on('data', function (rowData) {
        // choose function based on header. 
        //Improvement to drive this from definition
        if (header.functionId == 0) {
            rowData = helloWorld(rowData);
        } else if (header.functionId == 1) {
            rowData = aesEncryptData(rowData);
        } else if (header.functionId == 2) {
            rowData = aesDecryptData(rowData);
        } else if (header.functionId == 3) {
            rowData = fpeEncryptData(rowData);
        } else if (header.functionId == 4) {
            rowData = fpeDecryptData(rowData);
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

//functions part of the library that can be called from Qlik Sense
const helloWorld = (rowData) => {
    for (count = 0; count < rowData.rows.length; count++) {
        rowData.rows[count].duals[0].strData = 'Hello World';
        rowData.rows[count].duals[0].numData = 0;
    }
    return rowData;
}

//AES encryption/decryption
const aesEncryptData = (rowData) => {
   const cipher = crypto.createCipher(config.algorithm, config.key);
    for (count = 0; count < rowData.rows.length; count++) {
        let encrypted = cipher.update(rowData.rows[count].duals[0].strData, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        //console.log(encrypted);

        rowData.rows[count].duals[0].strData = encrypted;
        rowData.rows[count].duals[0].numData = 0;
    }
    return rowData;
}

const aesDecryptData = (rowData) => {
    const decipher = crypto.createDecipher(config.algorithm, config.key);
    for (count = 0; count < rowData.rows.length; count++) {
        let decrypted = decipher.update(rowData.rows[count].duals[0].strData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        //console.log(decrypted);

        rowData.rows[count].duals[0].strData = decrypted;
        rowData.rows[count].duals[0].numData = 0;
    }
    return rowData;
}

//FPE encryption/decryption
const fpeEncryptData = (rowData) => {
    const fpeCipher = fpeCrypto({password: config.key, domain: config.domain});
    for (count = 0; count < rowData.rows.length; count++) {
        
        rowData.rows[count].duals[0].strData = fpeCipher.encrypt(rowData.rows[count].duals[0].strData);
        rowData.rows[count].duals[0].numData = 0;
    }
    return rowData;
}

const fpeDecryptData = (rowData) => {
    const fpeCipher = fpeCrypto({password: config.key, domain: config.domain});
    for (count = 0; count < rowData.rows.length; count++) {
        
        rowData.rows[count].duals[0].strData = fpeCipher.decrypt(rowData.rows[count].duals[0].strData);
        rowData.rows[count].duals[0].numData = 0;
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