var fs = require('fs');
var ursa = require('ursa');
var _pubKey, _privKey;
var _pubPem, _privPem;
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
    
    _privPem = ursa.createPrivateKey(keys.toPrivatePem());
    _privKey = _privPem.toPrivatePem('utf8');
    
    _pubPem = ursa.createPublicKey(keys.toPublicPem());
    _pubKey = _pubPem.toPublicPem('utf8');
	return;
};


function getUserPrivKey(){
	return _privPem;
};


function getUserPubKey(){
	// why would user need to get pub key?
	return _pubPem;
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
