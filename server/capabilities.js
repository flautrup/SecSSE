var capabilities = {}; 

const protobuf = require("protobufjs");

var builder = protobuf.loadProtoFile('proto/ServerSideExtension.proto');
var proto = builder.build("qlik.sse");

capabilities = {
        allowScript: false,
        pluginIdentifier: 'secSSE',
        pluginVersion: 'v0.0.1',
        functions: [{
                functionId: 0,
                name: 'HelloWorld',
                functionType: proto.FunctionType.SCALAR,
                returnType: proto.DataType.STRING,
                params: [{
                    name: 'str1',
                    dataType: proto.DataType.STRING
                }]
            },
            {
                functionId: 1,
                name: 'AESEncryptData',
                functionType: proto.FunctionType.SCALAR,
                returnType: proto.DataType.STRING,
                params: [{
                    name: 'str1',
                    dataType: proto.DataType.STRING
                }]
            },
            {
                functionId: 2,
                name: 'AESDecryptData',
                functionType: proto.FunctionType.SCALAR,
                returnType: proto.DataType.STRING,
                params: [{
                    name: 'str1',
                    dataType: proto.DataType.STRING
                }]
            },
            {
                functionId: 3,
                name: 'FPEEncryptData',
                functionType: proto.FunctionType.SCALAR,
                returnType: proto.DataType.STRING,
                params: [{
                    name: 'str1',
                    dataType: proto.DataType.STRING
                }]
            },
            {
                functionId: 4,
                name: 'FPEDecryptData',
                functionType: proto.FunctionType.SCALAR,
                returnType: proto.DataType.STRING,
                params: [{
                    name: 'str1',
                    dataType: proto.DataType.STRING
                }]
            }
        ]
    };

module.exports = capabilities;    