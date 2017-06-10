var fs = require('fs');
var ursa = require('ursa');
var path_to_priv_key = "./.ppk.pem";
var path_to_pub_key = "./.pk.pem";
const hashMethod = "sha256";

module.exports = {
	genKeyPair: genKeyPair,
	getUserPrivKey: getUserPrivKey,
	getUserPubKey: getUserPubKey,
	createDigitalSignature: createDigitalSignature,
	verifyDigitalSignature: verifyDigitalSignature,
};


// for client side
function genKeyPair() {
    var keys = ursa.generatePrivateKey(2048);
    
    var privPem = ursa.createPrivateKey(keys.toPrivatePem());
    var privKey = privPem.toPrivatePem('utf8');
    
    fs.writeFile(path_to_priv_key, privKey, 'utf8', function(error){
		if(error){
			throw error;
		} else {
			console.log("Create private key success\n");
		}
	});
    
    var pubPem = ursa.createPublicKey(keys.toPublicPem());
    var pubKey = pubPem.toPublicPem('utf8');
    fs.writeFile(path_to_pub_key, pubKey, 'utf8', function(error){
		if(error){
			throw error;
		} else {
			console.log("Create public key success\n");
		}
	});
	return;
};


function getUserPrivKey(){
	var privKey = ursa.createPrivateKey(fs.readFileSync(path_to_priv_key));
	return privKey;
};


function getUserPubKey(){
	// why would user need to get pub key?
	var pubKey = ursa.createPublicKey(fs.readFileSync(path_to_pub_key));
	return pubKey;
};


function createDigitalSignature(msg){
	var privKey = getUserPrivKey();
	var digitalSignature = privKey.hashAndSign(hashMethod, msg, 'utf8', 'base64', false);
	console.log("Before signed:", msg);
	console.log("After signed:", digitalSignature);
	return digitalSignature;

};


// for server side
function verifyDigitalSignature(plainMessage, encryptMessage, userPubkey){
	//TODO accept user object instead of userPubkey
	var verifier = ursa.createVerifier(hashMethod);
	verifier.update(plainMessage);
	if(verifier.verify(userPubkey, encryptMessage, 'base64')) {
		console.log(encryptMessage, " matches the user");
		return true;
	} else {
		console.log(encryptMessage, " doesn't match the user");
		return false;
	}
};
