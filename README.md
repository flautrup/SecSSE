# Qlik Sense Analytic Extension for Security

## Description:
This is an example/PoC to show how server side extensions can be used to extend the scripting of Qlik Sense with aditional security functions to protect customer information. This is done with a Analytic Extension that will surface security functions to Qlik Sense to be used in scripts and expressions to protect data. Examples of functions exposed is
 * AES Encryption/Decryption function
 * Format preserving encryption/decryption

Future enhancement cound be to surface 
 * Industry hash function

 ## Installation:
 1. Download the code and unzip into folder
 2. Run `npm install`
 3. Update the config.js file with appropriate configuration. For testing, changes are not needed.
 3. Run `node server` from the root folder
 4. If successfull you should get `grpc server running on port: 0.0.0.0:50050`

Now the server is running and the next step is to set it up in Qlik Sense (example here is for enterprise version)
1. Go to the QMC and select `Analytic Connections`
2. Create New
3. Give it a name, `secSSE`
4. Add host where the node code was deployed
5. Put `50050` as port
6. As this is for demo/PoC purposes authenticated encypted connection is not used hence not need to add `Certificate file path` but this should be used in production to protect information.
7. Restart the engine

Debug information can be found in the engine logs.

Next step now is to use it. Easiest way to test is to create an app and use the script supplied in example_script.txt to test out the functionality.




 