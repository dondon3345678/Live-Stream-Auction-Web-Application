var fs = require('fs');
var ursa = require('ursa');
var _pubKey, _privKey;
var _pubPem, _privPem;
var path_to_priv_key = "./.ppk.pem";
var path_to_pub_key = "./.pk.pem";
const hashMethod = "sha256";

module.exports = {
	genKeyPair: genKeyPair,
	getUserPrivKeyPem: getUserPrivKeyPem,
	getUserPubKeyPem: getUserPubKeyPem,
	createDigitalSignature: createDigitalSignature,
	verifyDigitalSignature: verifyDigitalSignature,
};


// for client side
function genKeyPair() {
    var keys = ursa.generatePrivateKey(2048);
    
    _privKey = ursa.createPrivateKey(keys.toPrivatePem());
    _privPem = _privKey.toPrivatePem('utf8');
    
    _pubKey = ursa.createPublicKey(keys.toPublicPem());
    _pubPem = _pubKey.toPublicPem('utf8');
	return [_pubPem, _privPem];
};


function getUserPrivKeyPem(){
	return _privPem;
};


function getUserPubKeyPem(){
	// why would user need to get pub key?
	return _pubPem;
};


function createDigitalSignature(msg){
	var privKeyPem = getUserPrivKeyPem();
	var privKey = ursa.createPrivateKey(privKeyPem);
	var digitalSignature = privKey.hashAndSign(hashMethod, msg, 'utf8', 'base64', false);
	console.log("Before signed:", msg);
	console.log("After signed:", digitalSignature);
	return digitalSignature;

};


// for server side
function verifyDigitalSignature(plainMessage, encryptMessage, userPubkeyPem){
	//TODO accept user object instead of userPubkey
	var verifier = ursa.createVerifier(hashMethod);
	var userPubKey = ursa.createPublicKey(userPubkeyPem, "utf8");
	verifier.update(plainMessage);
	if(verifier.verify(userPubKey, encryptMessage, 'base64')) {
		console.log(encryptMessage, " matches the user");
		return true;
	} else {
		console.log(encryptMessage, " doesn't match the user");
		return false;
	}
};
