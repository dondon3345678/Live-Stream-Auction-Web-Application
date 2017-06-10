var fs = require('fs');
var ursa = require('ursa');
var path_to_priv_key = "./.ppk.pem";
var path_to_pub_key = "./.pk.pem";


function genKeyPair() {
    var keys = ursa.generatePrivateKey('base64');
    
    var privPem = ursa.createPrivateKey(keys.toPrivatePem());
    var privKey = privPem.toPrivatePem('utf8');
    
    fs.writeFile(path_to_priv_key, privKey, 'utf8', function(error){
		if(error){
			throw error;
		}
		console.log("Create private key success\n");
	});
    
    var pubPem = ursa.createPublicKey(keys.toPublicPme());
    var pubKey = pubPem.toPublicPem('utf8');
    fs.writeFile(path_to_pub_key, pubKey, 'utf8', function(error){
		if(error){
			throw error;
		}
		console.log("Create public key success\n");
	});
};


function getUserPrivKey(){
	var privKey = fs.readFile(path_to_priv_key, function(error){
		if(error){
			throw error;
		}
		console.log("Get private key success\n");
	});
	return privKey;
};


function getUserPubKey(){
	var pubKey = fs.readFile(path_to_pub_key, function(error){
		if(error){
			throw error;
		}
		console.log("Get public key success\n");
	});
	return pubKey;
};


function sendMessage(msg){
	var privKey = ursa.createPrivateKey(fs.readFileSync('./.ppk.pem'));
	var signer = ursa.createSigner();
	signer.sign(privKey, 'base64');
};
